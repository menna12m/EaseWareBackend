export default ({ env }) => {
  const cloudName = env("CLOUDINARY_NAME")
  const cloudKey = env("CLOUDINARY_KEY")
  const cloudSecret = env("CLOUDINARY_SECRET")
  const useCloudinary = Boolean(cloudName && cloudKey && cloudSecret)

  return {
    upload: useCloudinary
      ? {
          config: {
            provider: "cloudinary",
            providerOptions: {
              cloud_name: cloudName,
              api_key: cloudKey,
              api_secret: cloudSecret,
            },
            actionOptions: {
              upload: {},
              uploadStream: {},
              delete: {},
            },
          },
        }
      : {
          // Local filesystem provider — files saved to public/uploads/
          // Switch to Cloudinary by filling CLOUDINARY_* in .env.
          config: {
            sizeLimit: 25 * 1024 * 1024, // 25 MB
          },
        },
  }
}
