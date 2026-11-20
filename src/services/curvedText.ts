import { fabric } from 'fabric';

export interface CurvedTextOptions {
  text: string;
  radius: number;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  letterSpacing?: number;
  isArchUp?: boolean;
}

/**
 * Generates an arched or circular typography badge with clean curved layout.
 */
export function createCurvedTextGroup(
  options: CurvedTextOptions,
  centerX = 500,
  centerY = 400
): fabric.Group {
  const {
    text,
    radius = 200,
    fontSize = 54,
    fontFamily = 'Inter',
    fill = '#ffffff',
    stroke = '',
    strokeWidth = 0,
    letterSpacing = 1.0,
    isArchUp = true,
  } = options;

  const chars = text.split('');
  const totalChars = chars.length;
  if (totalChars === 0) return new fabric.Group([]);

  // Calculate arc spread based on length and radius
  const charAngularWidth = (fontSize / radius) * 0.75 * letterSpacing;
  const totalAngle = Math.min(Math.PI * 1.5, totalChars * charAngularWidth);
  const startAngle = -totalAngle / 2;
  const angleStep = totalChars > 1 ? totalAngle / (totalChars - 1) : 0;

  const textObjects: fabric.Text[] = [];

  for (let i = 0; i < totalChars; i++) {
    const currentAngle = startAngle + i * angleStep;
    // Circular trigonometry
    const x = Math.sin(currentAngle) * radius;
    const y = isArchUp ? -Math.cos(currentAngle) * radius : Math.cos(currentAngle) * radius;
    const charAngle = isArchUp ? (currentAngle * 180) / Math.PI : (-currentAngle * 180) / Math.PI;

    const charObj = new fabric.Text(chars[i], {
      left: x,
      top: y,
      fontSize,
      fontFamily,
      fill,
      stroke: stroke || undefined,
      strokeWidth: strokeWidth || 0,
      originX: 'center',
      originY: 'center',
      angle: charAngle,
      fontWeight: '800',
    });

    textObjects.push(charObj);
  }

  const group = new fabric.Group(textObjects, {
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center',
  });

  // Store metadata
  (group as any).isCurvedText = true;
  (group as any).curvedTextString = text;
  (group as any).curvedRadius = radius;

  return group;
}
