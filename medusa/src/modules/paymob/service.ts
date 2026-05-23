import {
  AbstractPaymentProvider,
  MedusaError,
  BigNumber,
} from "@medusajs/framework/utils"
import {
  Logger,
  ProviderWebhookPayload,
  WebhookActionResult,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
} from "@medusajs/framework/types"
import axios, { AxiosInstance } from "axios"

type PaymobOptions = {
  apiKey: string
  integrationId: string
  iframeId?: string
}

type InjectedDependencies = {
  logger: Logger
}

const PAYMOB_BASE = "https://accept.paymob.com/api"

/**
 * Paymob payment provider for Medusa v2.
 *
 * Flow (Paymob standard):
 *   1. POST /auth/tokens               → auth token
 *   2. POST /ecommerce/orders          → order registration
 *   3. POST /acceptance/payment_keys   → payment key (used in iframe)
 *
 * On webhook (HMAC-signed), Paymob calls back with transaction status.
 */
class PaymobPaymentProviderService extends AbstractPaymentProvider<PaymobOptions> {
  static identifier = "paymob"

  protected readonly logger_: Logger
  protected readonly options_: PaymobOptions
  protected readonly http_: AxiosInstance

  constructor(container: InjectedDependencies, options: PaymobOptions) {
    super(container, options)
    this.logger_ = container.logger
    this.options_ = options
    this.http_ = axios.create({
      baseURL: PAYMOB_BASE,
      timeout: 15_000,
      headers: { "Content-Type": "application/json" },
    })
  }

  static validateOptions(options: Record<string, any>) {
    if (!options.apiKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Paymob: apiKey is required"
      )
    }
    if (!options.integrationId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Paymob: integrationId is required"
      )
    }
  }

  protected async authToken(): Promise<string> {
    const { data } = await this.http_.post("/auth/tokens", {
      api_key: this.options_.apiKey,
    })
    return data.token as string
  }

  protected async registerOrder(
    authToken: string,
    amountCents: number,
    currency: string,
    merchantOrderId: string
  ): Promise<{ id: number }> {
    const { data } = await this.http_.post("/ecommerce/orders", {
      auth_token: authToken,
      delivery_needed: "false",
      amount_cents: amountCents,
      currency: currency.toUpperCase(),
      merchant_order_id: merchantOrderId,
      items: [],
    })
    return data
  }

  protected async paymentKey(
    authToken: string,
    paymobOrderId: number,
    amountCents: number,
    currency: string,
    billing: Record<string, any>
  ): Promise<string> {
    const { data } = await this.http_.post("/acceptance/payment_keys", {
      auth_token: authToken,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: {
        apartment: "NA",
        email: billing.email || "guest@easewear.local",
        floor: "NA",
        first_name: billing.first_name || "Easewear",
        street: "NA",
        building: "NA",
        phone_number: billing.phone || "+201000000000",
        shipping_method: "NA",
        postal_code: billing.postal_code || "NA",
        city: billing.city || "Cairo",
        country: billing.country_code || "EG",
        last_name: billing.last_name || "Customer",
        state: billing.province || "NA",
      },
      currency: currency.toUpperCase(),
      integration_id: Number(this.options_.integrationId),
    })
    return data.token as string
  }

  protected toAmountCents(amount: any): number {
    const n = typeof amount === "object" ? Number(amount.toString()) : Number(amount)
    return Math.round(n * 100)
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const amountCents = this.toAmountCents(input.amount)
    const currency = input.currency_code || "egp"
    const merchantOrderId = `easewear-${Date.now()}`

    try {
      const authToken = await this.authToken()
      const order = await this.registerOrder(
        authToken,
        amountCents,
        currency,
        merchantOrderId
      )
      const paymentToken = await this.paymentKey(
        authToken,
        order.id,
        amountCents,
        currency,
        input.context?.customer ?? {}
      )

      return {
        id: String(order.id),
        status: "pending",
        data: {
          paymob_order_id: order.id,
          payment_token: paymentToken,
          iframe_id: this.options_.iframeId,
          iframe_url: this.options_.iframeId
            ? `https://accept.paymob.com/api/acceptance/iframes/${this.options_.iframeId}?payment_token=${paymentToken}`
            : null,
          merchant_order_id: merchantOrderId,
        },
      }
    } catch (e: any) {
      this.logger_.error("[paymob] initiate failed: " + e?.message)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Paymob initiate failed: ${e?.message}`
      )
    }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    // Paymob requires re-creating a payment key when the amount changes.
    const re = await this.initiatePayment(input as InitiatePaymentInput)
    return { data: re.data, status: re.status }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const data = input.data ?? {}
    const status = (data.status as string) ?? "pending"
    return {
      status: status === "captured" ? "authorized" : (status as any),
      data,
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return { data: { ...(input.data ?? {}), status: "captured" } }
  }

  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return { data: { ...(input.data ?? {}), status: "canceled" } }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    try {
      const authToken = await this.authToken()
      const { data } = await this.http_.post("/acceptance/void_refund/refund", {
        auth_token: authToken,
        transaction_id: input.data?.transaction_id,
        amount_cents: this.toAmountCents(input.amount),
      })
      return { data: { ...(input.data ?? {}), refund: data } }
    } catch (e: any) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Paymob refund failed: ${e?.message}`
      )
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const status = (input.data?.status as any) ?? "pending"
    return { status, data: input.data ?? {} }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const body: any = (payload.data as any)?.obj ?? payload.data ?? {}
    const success = body?.success === true || body?.success === "true"
    const merchantOrderId =
      body?.order?.merchant_order_id ?? body?.merchant_order_id ?? ""
    const amount = Number(body?.amount_cents ?? 0) / 100

    return {
      action: success ? "captured" : "failed",
      data: {
        session_id: String(merchantOrderId),
        amount: new BigNumber(amount),
      },
    }
  }
}

export default PaymobPaymentProviderService
