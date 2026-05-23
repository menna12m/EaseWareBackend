import { revalidate } from "../../../../utils/revalidate"

export default {
  async afterCreate() {
    await revalidate("policies")
  },
  async afterUpdate() {
    await revalidate("policies")
  },
  async afterDelete() {
    await revalidate("policies")
  },
}
