import { revalidate } from "../../../../utils/revalidate"

export default {
  async afterCreate() {
    await revalidate("home")
  },
  async afterUpdate() {
    await revalidate("home")
  },
  async afterDelete() {
    await revalidate("home")
  },
}
