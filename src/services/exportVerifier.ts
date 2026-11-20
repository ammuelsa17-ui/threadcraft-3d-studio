export interface ExportVerificationResult {
  isValid: boolean;
  format: 'png' | 'svg' | 'json';
  widthPx?: number;
  heightPx?: number;
  hasAlphaChannel?: boolean;
  byteSize: number;
  errors: string[];
}

export class ExportVerifier {
  /**
   * Programmatically verifies an exported transparent PNG data URL.
   */
  static async verifyPng(
    dataUrl: string,
    expectedWidthPx: number,
    expectedHeightPx: number
  ): Promise<ExportVerificationResult> {
    const errors: string[] = [];
    const byteSize = Math.round((dataUrl.length * 3) / 4);

    if (!dataUrl.startsWith('data:image/png;base64,')) {
      errors.push('Data URL header is not a valid PNG.');
      return { isValid: false, format: 'png', byteSize, errors };
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width !== expectedWidthPx) {
          errors.push(`Width mismatch: expected ${expectedWidthPx}px, got ${img.width}px.`);
        }
        if (img.height !== expectedHeightPx) {
          errors.push(`Height mismatch: expected ${expectedHeightPx}px, got ${img.height}px.`);
        }

        // Check transparency by sampling pixels
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(100, img.width);
        canvas.height = Math.min(100, img.height);
        const ctx = canvas.getContext('2d');
        let hasAlphaChannel = true;

        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // Look for transparent pixels (alpha < 255)
          let foundTransparent = false;
          for (let i = 3; i < imgData.data.length; i += 4) {
            if (imgData.data[i] < 255) {
              foundTransparent = true;
              break;
            }
          }
          hasAlphaChannel = foundTransparent;
        }

        resolve({
          isValid: errors.length === 0,
          format: 'png',
          widthPx: img.width,
          heightPx: img.height,
          hasAlphaChannel,
          byteSize,
          errors,
        });
      };

      img.onerror = () => {
        errors.push('Failed to decode exported image bytes.');
        resolve({ isValid: false, format: 'png', byteSize, errors });
      };

      img.src = dataUrl;
    });
  }

  /**
   * Programmatically verifies SVG vector content.
   */
  static verifySvg(svgString: string): ExportVerificationResult {
    const errors: string[] = [];
    const byteSize = new Blob([svgString]).size;

    if (!svgString.includes('<svg') || !svgString.includes('</svg>')) {
      errors.push('Invalid SVG markup: missing root <svg> tags.');
    }
    if (!svgString.includes('viewBox')) {
      errors.push('Missing viewBox in SVG root element.');
    }

    return {
      isValid: errors.length === 0,
      format: 'svg',
      byteSize,
      errors,
    };
  }

  /**
   * Programmatically verifies a project backup JSON string.
   */
  static verifyProjectBackup(jsonString: string): ExportVerificationResult {
    const errors: string[] = [];
    const byteSize = new Blob([jsonString]).size;

    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.name) errors.push('Missing project name.');
      if (!parsed.productType) errors.push('Missing productType.');
      if (!parsed.canvases) errors.push('Missing canvases map.');
    } catch (e) {
      errors.push('Invalid JSON syntax: failed to parse project file.');
    }

    return {
      isValid: errors.length === 0,
      format: 'json',
      byteSize,
      errors,
    };
  }
}
