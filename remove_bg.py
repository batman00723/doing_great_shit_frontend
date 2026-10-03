import sys
sys.path.append('C:/Users/batma/AppData/Roaming/Python/Python313/site-packages')
from PIL import Image

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    datas = img.getdata()

    new_data = []
    # threshold for considering a pixel 'background'
    # The background is likely off-white #FDFCF8 (253, 252, 248) or similar
    for item in datas:
        # If it's very bright (near white), make it transparent
        if item[0] > 235 and item[1] > 235 and item[2] > 235:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, 'PNG')

remove_white_bg('public/images/vhs-tape.jpg', 'public/images/vhs-tape-transparent.png')
