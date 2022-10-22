import { Table } from "@mantine/core";
import { Click } from "@prisma/client";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

type LoaderData = {
  track: {
    trackId: string;
    clicks: Click[];
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const track = await db.track.findUnique({
    where: {
      trackId: params.trackId,
    },
    select: {
      trackId: true,
      clicks: {
        orderBy: [
          {
            createdAd: "desc",
          },
        ],
      },
    },
  });

  if (!track) throw new Error(`Track ${params.trackId} does not exist`);

  const data: LoaderData = { track };

  return json(data);
};

export default function TrackRoute() {
  const data = useLoaderData<LoaderData>();

  const rows = data.track.clicks.map((click) => (
    <tr key={click.id}>
      <td>
        {new Date(click.createdAd).toLocaleDateString([], { hour12: true })}
      </td>
      <td>{click.userAgent}</td>
      <td>{click.ip}</td>
    </tr>
  ));

  return (
    <div>
      <Table>
        <thead>
          <tr>Date</tr>
          <tr>User agent</tr>
          <tr>IP</tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      <a href={`/${data.track.trackId}`}>TEXT</a>
    </div>
  );
}
