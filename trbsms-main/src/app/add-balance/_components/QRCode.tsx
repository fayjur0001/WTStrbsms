"use client";

import { QRCodeSVG } from "qrcode.react";
import Card from "./card";

export default function QRCode({ value }: { value: string }) {
  return (
    <Card className="flex-1 flex justify-center items-center">
      <div className="bg-white p-4 rounded-md shadow-md">
        <QRCodeSVG value={value} bgColor="transparent" fgColor="black" />
      </div>
    </Card>
  );
}
