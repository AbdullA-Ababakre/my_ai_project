import { toString } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    res.status(200).json({ result: "something" });
  } catch (err) {
    res.status(500).json({ error: "failed to load data" });
  }
}
