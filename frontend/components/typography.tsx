import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";

type Weight = "regular" | "medium" | "semibold" | "bold";
type FontType = 1 | 2 | 3; // 1=Inter, 2=NotoSansThai, 3=InriaSans

interface TypographyProps extends TextProps {
  weight?: Weight;
  size?: number;
  color?: string;
  fontType?: FontType; // optional override
  children: React.ReactNode;
}

export default function Typography({
  weight = "regular",
  size = 16,
  color = "#000",
  fontType,
  style,
  children,
  ...props
}: TypographyProps) {
  const isThaiText = containsThai(children);

  return (
    <Text
      style={[
        {
          fontFamily: getFont(weight, isThaiText, fontType),
          fontSize: size,
          color,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Detect Thai text
function containsThai(text: React.ReactNode) {
  if (typeof text !== "string") return false;
  return /[\u0E00-\u0E7F]/.test(text);
}

// Font selection logic
function getFont(weight: Weight, isThai: boolean, fontType?: FontType) {
  let w = "Regular";

  if (weight === "medium") w = "Medium";
  else if (weight === "semibold") w = "SemiBold";
  else if (weight === "bold") w = "Bold";

  // user override
  if (fontType === 1) return `Inter-${w}`;
  if (fontType === 2) return `NotoSansThai-${w}`;
  if (fontType === 3) return `InriaSans-${w}`;

  // default behavior
  if (isThai) {
    return `NotoSansThai-${w}`;
  } else {
    return `Inter-${w}`;
  }
}

const styles = StyleSheet.create({});