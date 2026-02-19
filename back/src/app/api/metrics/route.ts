import { NextResponse } from "next/server";
import { register } from "@/lib/metrics/prometheus";

export async function GET() {
	try {
		const metrics = await register.metrics();
		return new NextResponse(metrics, {
			status: 200,
			headers: {
				"Content-Type": register.contentType || "text/plain; version=0.0.4; charset=utf-8",
			},
		});
	} catch (error) {
		console.error("Error generating metrics:", error);
		return NextResponse.json(
			{ error: "Failed to generate metrics" },
			{ status: 500 }
		);
	}
}

