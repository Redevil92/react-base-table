import { useEffect, useRef, useState } from "react";
import { TwitterPicker, type ColorResult, type RGBColor } from "react-color";

const ColorPicker = ({
  initialColor,
  applyOpacity,
  onColorChange,
  onClose,
}: {
  initialColor?: string;
  applyOpacity?: number;
  onColorChange: (color: string) => void;
  onClose?: () => void;
}) => {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [color, setColor] = useState<RGBColor>({
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });

  const [pickerPosition, setPickerPosition] = useState<"left" | "right">(
    "left"
  );
  const colorBoxRef = useRef<HTMLDivElement>(null);

  const RBGAColorToStringStyle = (color: RGBColor): string => {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${
      applyOpacity ?? color.a
    })`;
  };

  function hexToRgba(hex: string, alpha = 1): RGBColor {
    let c = hex.replace("#", "");
    if (c.length === 3) {
      c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    return { r, g, b, a: alpha } as RGBColor;
    // return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  useEffect(() => {
    if (initialColor) {
      if (
        typeof initialColor === "string" &&
        /^#([A-Fa-f0-9]{3}){1,2}$/.test(initialColor)
      ) {
        // Handle hex
        const rgbaColor = hexToRgba(initialColor, 1);
        setColor(rgbaColor);
      } else if (
        typeof initialColor === "string" &&
        /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/.test(
          initialColor
        )
      ) {
        // Handle rgba or rgb
        const match = initialColor.match(
          /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/
        );
        if (match) {
          const [, r, g, b, a] = match;
          setColor({
            r: Number(r),
            g: Number(g),
            b: Number(b),
            a: a !== undefined ? Number(a) : 1,
          });
        }
      }
    }
  }, [initialColor]);

  const checkPosition = () => {
    if (colorBoxRef.current) {
      const rect = colorBoxRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const pickerWidth = 276; // TwitterPicker width

      // If there's not enough space to the right (less than picker width + some margin)
      if (viewportWidth - rect.right < pickerWidth + 20) {
        setPickerPosition("right");
      } else {
        setPickerPosition("left");
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    checkPosition();
    setDisplayColorPicker(!displayColorPicker);
  };
  const handleClose = () => {
    setDisplayColorPicker(false);
    onClose?.();
  };

  const handleChange = (colorResult: ColorResult) => {
    // set defaultOpacity to colorResult.rgb.a if any
    if (applyOpacity !== undefined) {
      colorResult.rgb.a = applyOpacity;
    }
    console.log("Color changed:", colorResult);
    setColor(colorResult.rgb);
    onColorChange(RBGAColorToStringStyle(colorResult.rgb));
  };

  const colorBoxStyle: React.CSSProperties = {
    background: RBGAColorToStringStyle(color),
  };

  return (
    <div className="relative">
      <div
        ref={colorBoxRef}
        className="inline-block cursor-pointer  bg-slate-50 rounded border border-neutral-100 shadow"
        onClick={handleClick}
      >
        <div className="w-8 h-4 rounded" style={colorBoxStyle} />
      </div>
      {displayColorPicker && (
        <div
          className={`absolute z-20 mt-2 ${
            pickerPosition === "right" ? "right-0" : "left-0"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {/* Overlay to close */}
          <div className="fixed inset-0" onClick={handleClose} />
          <TwitterPicker
            color={color}
            triangle={pickerPosition === "right" ? "top-right" : "top-left"}
            colors={[
              "#ffc094",
              "#fee7a8",
              "#b5f1db",
              "#d0ecfe",
              "#9ed5f4",
              "#d2d9df",
              "#f8b2c4",
              "#F78DA7",
              "#d89ef9",
            ]}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
