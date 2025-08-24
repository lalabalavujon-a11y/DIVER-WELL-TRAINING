import { prisma } from "../src/lib/prisma"

async function main() {
	const tracks = [
		{ title: "Physiology Basics", slug: "physiology", summary: "Core physiology concepts for divers" },
		{ title: "Decompression", slug: "decompression", summary: "Tables & theory (brand‑neutral)" },
	]

	for (const t of tracks) {
		const track = await prisma.track.upsert({
			where: { slug: t.slug },
			update: {},
			create: t,
		})

		await prisma.lesson.upsert({
			where: { id: `${track.id}-intro` },
			update: {},
			create: {
				id: `${track.id}-intro`,
				trackId: track.id,
				title: `${t.title} — Intro`,
				order: 1,
				content: "Welcome to the brand‑neutral Diver Well training track.",
			},
		})
	}

	const bcrypt = await import("bcryptjs")
	const hash = await bcrypt.hash("admin123", 12)
	await prisma.user.upsert({
		where: { email: "admin@diverwell.app" },
		update: {},
		create: { email: "admin@diverwell.app", password: hash, role: "ADMIN", name: "Admin" },
	})
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})