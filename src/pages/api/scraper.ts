import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parse } from "node-html-parser";

const items: Array<{
  author: string;
  name: string;
  price: string;
  currency: string;
  availability: string;
  store: string;
}> = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get(
      "https://www.sfparis.com/advSearchResults.php?action=search&fromForm=1&category_id=&authorField=&titleField=&publisherField=&keywordsField=&priceStart=&priceEnd=&orderBy=author&recordsLength=100"
    );
    const root = parse(response.data);

    root
      .querySelectorAll("div.booklisting-description")
      .slice(0, 3)
      .forEach((book) => {
        const author = book.querySelector('span[itemprop="author"]')!.text.trim();
        const name = book.querySelector('span[itemprop="name"]')!.text.trim();
        const priceTagContainer = book.parentNode?.parentNode?.querySelector("p.price");

        const price = priceTagContainer?.querySelector("span.BL_pr2")?.attributes.content ?? "N/A";
        const currency = priceTagContainer?.querySelector('meta[itemprop="priceCurrency"]')?.attributes.content ?? "";
        const availability = priceTagContainer?.querySelector('meta[itemprop="availability"]')?.attributes.content ?? "";

        const item = {
          author,
          name,
          price,
          currency,
          availability,
          store: "sfparis",
        };

        items.push(item);
      });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
}
