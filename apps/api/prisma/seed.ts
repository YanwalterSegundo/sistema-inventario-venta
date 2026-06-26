import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Demo12345", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador Demo",
      email: "admin@demo.com",
      passwordHash,
      role: "ADMIN"
    }
  });

  const tecnologia = await prisma.category.create({ data: { name: "Tecnologia" } });
  const oficina = await prisma.category.create({ data: { name: "Oficina" } });
  const accesorios = await prisma.category.create({ data: { name: "Accesorios" } });

  await prisma.product.createMany({
    data: [
      {
        name: "Laptop Lenovo ThinkPad",
        sku: "LAP-LEN-001",
        price: 2800,
        stock: 8,
        minStock: 3,
        categoryId: tecnologia.id
      },
      {
        name: "Mouse inalambrico",
        sku: "ACC-MOU-001",
        price: 45,
        stock: 30,
        minStock: 10,
        categoryId: accesorios.id
      },
      {
        name: "Teclado mecanico",
        sku: "ACC-TEC-001",
        price: 180,
        stock: 12,
        minStock: 5,
        categoryId: accesorios.id
      },
      {
        name: "Silla ergonomica",
        sku: "OFI-SIL-001",
        price: 420,
        stock: 4,
        minStock: 5,
        categoryId: oficina.id
      }
    ]
  });

  const customer = await prisma.customer.create({
    data: {
      name: "Cliente Demo",
      document: "00000000",
      phone: "999999999",
      email: "cliente.demo@example.com"
    }
  });

  const mouse = await prisma.product.findUniqueOrThrow({ where: { sku: "ACC-MOU-001" } });

  await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        code: "VTA-000001",
        total: 90,
        customerId: customer.id,
        userId: admin.id
      }
    });

    await tx.saleItem.create({
      data: {
        saleId: sale.id,
        productId: mouse.id,
        quantity: 2,
        unitPrice: 45,
        subtotal: 90
      }
    });

    await tx.product.update({
      where: { id: mouse.id },
      data: { stock: { decrement: 2 } }
    });
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
