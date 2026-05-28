Create a high-fidelity AI Grounds app screenshot for a PyTorch image transforms playground. Keep the existing AI Grounds visual system: huge black title, dark-blue subtitle, pale blue bordered compact panel, electric-blue active controls, mono values/code, no nav/sidebar/marketing hero.

Header:
Title: "PyTorch Image Transforms"
Subtitle: "Stack transforms on one image and watch the composed result update."
Help button top right: "What changes and what stays?"

Main panel title: "1. Stack transforms and preview the result"
Inside: two-column layout.

LEFT COLUMN, about 42% width:
Top: vertical transform stack. Each transform block has a drag handle, order number, transform name, enabled toggle, remove icon, and its own controls inside the block.
Blocks:
1 RandomResizedCrop enabled: min crop area slider value 0.72, resample crop button, mono value 0.72.
2 Rotation enabled: max degrees slider value 12deg, mono value 12deg.
3 ColorJitter enabled: brightness slider 0.30, contrast slider 0.30, mono values.
4 GaussianBlur disabled muted: max sigma slider 0.8 greyed.
5 RandomErasing disabled muted: max erase area slider 0.12 greyed.

Under the transform stack in the same left column: code box titled "Generated torchvision code" with copy button and mono code:
from torchvision.transforms import v2
transform = v2.Compose([
    v2.RandomResizedCrop(size=(224, 224), scale=(0.72, 1.0)),
    v2.RandomRotation(degrees=12),
    v2.ColorJitter(brightness=0.30, contrast=0.30),
])
image = transform(image)

RIGHT COLUMN, about 58% width:
Top: compact image selector row titled "Choose an image" with thumbnails cat selected, sneaker, stop sign, leaf.
Below selector: large two-pane comparison. Left pane "Original" with cat image and crop rectangle overlay. Right pane "Composed result" with cropped, rotated, color-jittered cat. Between panes a small arrow labeled "top to bottom".
Below image panes: compact status row with label mode one-hot, class cat, active transforms 3.
Bottom of right column: small takeaway strip: "Transforms compound: each block receives the image from the block above it."

Important constraints: no separate transform palette, no separate pipeline list, no extra panels. Image selector must be on the right. Code must be under the transform sliders on the left. Keep transform blocks compact; disabled blocks shorter and muted. Make all text readable and not clipped.
