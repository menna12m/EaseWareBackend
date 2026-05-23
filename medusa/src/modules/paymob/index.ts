import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import PaymobPaymentProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [PaymobPaymentProviderService],
})
