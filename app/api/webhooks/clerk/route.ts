import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const payload = await req.json();

  if (payload.type === "user.created") {
    const { id, email_addresses, first_name } = payload.data;

    await prisma.user.create({
      data: {
        clerkId: id,
        email: email_addresses[0].email_address,
        name: first_name,
      },
    });
  }

  return new Response("ok", { status: 200 });
}
