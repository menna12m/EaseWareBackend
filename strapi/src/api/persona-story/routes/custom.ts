export default {
  routes: [
    {
      method: "GET",
      path: "/persona-stories/:slug/product-handles",
      handler: "custom.productHandles",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
}
