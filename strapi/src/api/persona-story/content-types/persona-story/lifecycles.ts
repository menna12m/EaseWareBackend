import { revalidate } from "../../../../utils/revalidate"

export default {
  async afterCreate() {
    await revalidate("stories")
  },
  async afterUpdate() {
    await revalidate("stories")
  },
  async afterDelete() {
    await revalidate("stories")
  },
}
