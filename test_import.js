const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testImport() {
  const products = [
    {
      "name": "iPhone 17 Pro",
      "modelId": "iphone-17-pro",
      "description": "Next-gen flagship",
      "category": "Mobiles",
      "image": "https://example.com/iphone.jpg",
      "processor": "A19 Pro",
      "screen": "6.7 inch OLED",
      "ram": "8GB",
      "storage": "128GB",
      "colorName": "Space Black",
      "colorCode": "#000000",
      "price": 129999,
      "stock": 50,
      "hasVariants": true,
      "variants": [
        {
          "ram": "8GB",
          "storage": "128GB",
          "colorName": "Space Black",
          "colorCode": "#000000",
          "image": "https://example.com/iphone.jpg",
          "price": 129999,
          "mrp": 139999,
          "stock": 50
        },
        {
          "ram": "8GB",
          "storage": "256GB",
          "colorName": "Natural Titanium",
          "colorCode": "#bebebe",
          "image": "",
          "price": 139999,
          "mrp": 149999,
          "stock": 30
        }
      ]
    }
  ];

  try {
    const results = await prisma.$transaction(async (tx) => {
      const processed = [];
      
      for (const p of products) {
        const { variants, id, ...rawProductData } = p;
        
        const productData = {
          ...rawProductData,
          colorName: rawProductData.colorName || null,
          colorCode: rawProductData.colorCode || null,
        };
        
        if (id) {
          const res = await tx.product.upsert({
            where: { id },
            update: {
              ...productData,
              variants: variants && variants.length > 0 ? {
                deleteMany: {},
                create: variants.map((v) => ({
                  ram: String(v.ram),
                  storage: String(v.storage),
                  colorName: v.colorName || null,
                  colorCode: v.colorCode || null,
                  image: v.image || null,
                  price: parseFloat(v.price),
                  mrp: v.mrp ? parseFloat(v.mrp) : null,
                  stock: parseInt(v.stock) || 0
                }))
              } : undefined
            },
            create: {
              ...productData,
              variants: variants && variants.length > 0 ? {
                create: variants.map((v) => ({
                  ram: String(v.ram),
                  storage: String(v.storage),
                  colorName: v.colorName || null,
                  colorCode: v.colorCode || null,
                  image: v.image || null,
                  price: parseFloat(v.price),
                  mrp: v.mrp ? parseFloat(v.mrp) : null,
                  stock: parseInt(v.stock) || 0
                }))
              } : undefined
            }
          });
          processed.push(res);
        } else {
          const existing = await tx.product.findFirst({
            where: {
              name: productData.name,
              colorName: productData.colorName || null,
              modelId: productData.modelId || null,
            }
          });

          if (existing) {
            const res = await tx.product.update({
              where: { id: existing.id },
              data: {
                ...productData,
                variants: variants && variants.length > 0 ? {
                  deleteMany: {},
                  create: variants.map((v) => ({
                    ram: String(v.ram),
                    storage: String(v.storage),
                    colorName: v.colorName || null,
                    colorCode: v.colorCode || null,
                    image: v.image || null,
                    price: parseFloat(v.price),
                    mrp: v.mrp ? parseFloat(v.mrp) : null,
                    stock: parseInt(v.stock) || 0
                  }))
                } : undefined
              }
            });
            processed.push(res);
          } else {
            const res = await tx.product.create({
              data: {
                ...productData,
                variants: variants && variants.length > 0 ? {
                  create: variants.map((v) => ({
                    ram: String(v.ram),
                    storage: String(v.storage),
                    colorName: v.colorName || null,
                    colorCode: v.colorCode || null,
                    image: v.image || null,
                    price: parseFloat(v.price),
                    mrp: v.mrp ? parseFloat(v.mrp) : null,
                    stock: parseInt(v.stock) || 0
                  }))
                } : undefined
              }
            });
            processed.push(res);
          }
        }
      }
      return processed;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });
    
    console.log("Success! Processed:", results.length);
  } catch (error) {
    console.error("Bulk Import Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testImport();
