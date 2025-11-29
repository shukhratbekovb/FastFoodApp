from PIL import Image, ImageDraw, ImageFont
from datetime import datetime

from schemas import PrintSchema

WIDTH = 570  # 80mm
PADDING = 25
LINE_SPACING = 8
FONT = "DejaVuSansMono.ttf"
FONT1 = "upheavtt.ttf"


def load_font(size, font=FONT):
    try:
        return ImageFont.truetype(font, size)
    except:
        return ImageFont.load_default()


font_title = load_font(32)
font_medium = load_font(26)
font_text = load_font(24)
font_big = load_font(140, FONT1)
font_bold = load_font(28)


def generate_receipt(request: PrintSchema, mode="client"):
    """
    mode = "client"  -> Цены + Итог + Лого
    mode = "kitchen" -> Только список блюд, без логотипа, цен и итога
    """

    total = request.total
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    img = Image.new("L", (WIDTH, 1400), 255)
    draw = ImageDraw.Draw(img)
    y = PADDING

    # -------------------- Клиент: Лого + Order № --------------------
    if mode == "client":
        draw.text((WIDTH // 2, y), "FAST FOOD DOUBLE", font=font_title, anchor="mm")
        y += font_title.getbbox("T")[3] + 20
        draw.text((WIDTH // 2, y), f"Заказ № {request.order_id}", font=font_medium, anchor="mm")
        y += font_medium.getbbox("T")[3] + 20
    else:
        # Кухня — без логотипа
        draw.text((WIDTH // 2, y), f"Заказ № {request.order_id}", font=font_medium, anchor="mm")
        y += font_medium.getbbox("T")[3] + 20

    # Линия
    draw.line((PADDING, y, WIDTH - PADDING, y), fill=0, width=2)
    y += 40

    # -------------------- Товары --------------------
    max_width = WIDTH - PADDING * 2

    for item in request.products:
        name = f"{item.name} (x{item.quantity})"

        if mode == "client":
            price = f"{item.price} UZS"

            name_width = draw.textlength(name, font=font_text)
            price_width = draw.textlength(price, font=font_text)
            available_width = max_width - price_width - 20

            lines = []  # ← сюда записываем строки названия

            # ---- Перенос по словам ----
            if name_width > available_width:
                words = name.split()
                line = ""

                for w in words:
                    test_line = (line + " " + w).strip()

                    if draw.textlength(test_line, font=font_text) <= available_width:
                        line = test_line
                    else:
                        lines.append(line)
                        line = w

                if line:
                    lines.append(line)
            else:
                lines = [name]

            # ---- Рисуем строки ----
            # Цена всегда около первой строки
            draw.text((WIDTH - PADDING, y), price, font=font_text, anchor="rs")

            for i, ln in enumerate(lines):
                draw.text((PADDING, y), ln, font=font_text, anchor="ls")
                y += font_text.getbbox("T")[3] + LINE_SPACING

            # Дополнительный разделяющий отступ если строк больше одной
            if len(lines) > 1:
                y += 6

        else:
            # Кухня — только название
            draw.text((PADDING, y), name, font=font_text)
            y += font_text.getbbox("T")[3] + LINE_SPACING

        y += font_text.getbbox("T")[3] + LINE_SPACING

    # -------------------- Линия + Большой номер --------------------
    y += font_text.getbbox("T")[3]
    draw.line((PADDING, y, WIDTH - PADDING, y), fill=0, width=2)
    y += 80

    draw.text((WIDTH // 2, y), str(request.order_id), font=font_big, anchor="mm")
    y += font_big.getbbox("T")[3] + 40

    # -------------------- Итог (только клиент) --------------------
    if mode == "client":
        h = font_bold.getbbox("T")[3]
        draw.text((PADDING, y), "Итого:", font=font_bold, anchor="ls")
        draw.text((WIDTH - PADDING, y), f"{total} UZS", font=font_bold, anchor="rs")
        y += h + 20

    draw.text((PADDING, y), f"Дата Создание: {date_str}", font=font_text)
    y += font_text.getbbox("T")[3] + 10

    img = img.crop((0, 0, WIDTH, y + 20))
    return img


def print_receipt(p, request: PrintSchema, mode="client"):
    img = generate_receipt(request, mode)
    filename = f"check_{mode}.png"
    img.save(filename)
    print(f"✔ Создан: {filename}")
    p.image(filename)
    p.cut()
