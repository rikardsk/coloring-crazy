# Creating & Converting Coloring Pages in Antigravity

Google Antigravity supports both generating new coloring pages from text prompts and converting personal photos into printable line-art coloring pages.

---

## 1. Generating Coloring Pages from Scratch (AI Image Generation)

Antigravity features a built-in `generate_image` tool. You can request custom coloring pages directly in conversation using line-art prompts.

### Example Prompts
- *"Generate a clean black-and-white vector line-art coloring page of a cute castle with dragons, high contrast, white background."*
- *"Create an intricate mandala coloring page for adults with floral patterns, black outlines only."*

---

## 2. Converting Personal Photos into Coloring Pages

You can upload a photo (e.g., `portrait.jpg`, `pet.jpg`, or `landscape.jpg`) to your workspace and convert it using two methods:

### Method A: AI Image-to-Image Transformation
Antigravity passes your photo to the image generator with a line-art transformation prompt:
> *"Transform `portrait.jpg` into a clean black-and-white coloring page drawing. Retain facial features, use bold black outlines, white background, no grayscale shading."*

### Method B: Local Python Processing (OpenCV Line Extraction)
Antigravity writes and executes a local Python script using **OpenCV** to extract precise edge outlines, remove shading, and output a high-contrast printable PNG.

```python
import cv2

def photo_to_coloring_page(input_photo_path, output_png_path):
    # 1. Load photo & convert to grayscale
    img = cv2.imread(input_photo_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 2. Smooth noise while preserving edges
    blurred = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
    
    # 3. Detect edges & invert (Black outlines on White background)
    edges = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, blockSize=9, C=2
    )
    
    # 4. Save clean coloring page PNG
    cv2.imwrite(output_png_path, edges)
    print(f"Coloring page saved to {output_png_path}")

# Run conversion on uploaded photo
photo_to_coloring_page("my_photo.jpg", "my_coloring_page.png")
```

---

## Summary
| Source | Technique | Output |
| :--- | :--- | :--- |
| **Text Prompt** | AI `generate_image` tool | New vector line-art coloring page |
| **Uploaded Photo** | OpenCV edge thresholding / AI edit | Personalized printable line-art PNG |
