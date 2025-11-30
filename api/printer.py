import pytz
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime

from schemas import PrintSchema

TIMEZONE = pytz.timezone("Asia/Tashkent")

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


def generate_receipt(request, mode="client"):
    """
    mode = "client"   -> ЧЕК ДЛЯ КЛИЕНТА
    mode = "kitchen"  -> ЧЕК ДЛЯ КУХНИ
    mode = "internal" -> ВНУТРЕННИЙ УЧЕТ (LargePrintSchema)
    """

    date_str = datetime.now(tz=TIMEZONE).strftime("%Y-%m-%d %H:%M")

    img = Image.new("L", (WIDTH, 2000), 255)
    draw = ImageDraw.Draw(img)

    y = PADDING

    # -------------------- CLIENT MODE --------------------
    if mode == "client":
        draw.text((WIDTH // 2, y), "FAST FOOD DOUBLE", font=font_title, anchor="mm")
        y += font_title.getbbox("T")[3] + 20

        draw.text((WIDTH // 2, y), f"Заказ № {request.order_id}", font=font_medium, anchor="mm")
        y += font_medium.getbbox("T")[3] + 20

    # -------------------- KITCHEN MODE --------------------
    elif mode == "kitchen":
        draw.text((WIDTH // 2, y), f"Заказ № {request.order_id}", font=font_medium, anchor="mm")
        y += font_medium.getbbox("T")[3] + 20

    # -------------------- INTERNAL MODE --------------------
    elif mode == "internal":
        draw.text((WIDTH // 2, y), "ВНУТРЕННИЙ УЧЕТ", font=font_title, anchor="mm")
        y += font_title.getbbox("T")[3] + 20

        draw.text((PADDING, y), f"Всего заказов: {request.total_orders}", font=font_medium)
        y += font_medium.getbbox("T")[3] + 10

        draw.text((PADDING, y), f"Общая сумма: {request.total_price} UZS", font=font_medium)
        y += font_medium.getbbox("T")[3] + 20

        draw.line((PADDING, y, WIDTH - PADDING, y), fill=0, width=2)
        y += 40

    # -------------------- LINE --------------------
    if mode != "internal":
        draw.line((PADDING, y, WIDTH - PADDING, y), fill=0, width=2)
        y += 40

    # =======================================================
    #                     ТОВАРЫ
    # =======================================================

    max_width = WIDTH - PADDING * 2

    for item in request.products:

        # ---------- INTERNAL: только суммарные данные ----------
        if mode == "internal":
            line = f"{item.name} x{item.quantity}"
            draw.text((PADDING, y), line, font=font_text)
            y += font_text.getbbox("T")[3] + LINE_SPACING
            continue

        # ---------- KITCHEN ----------
        if mode == "kitchen":
            name = f"{item.name} (x{item.quantity})"
            draw.text((PADDING, y), name, font=font_text)
            y += font_text.getbbox("T")[3] + LINE_SPACING
            continue

        # ---------- CLIENT ----------
        name = f"{item.name} (x{item.quantity})"
        price = f"{item.price} UZS"

        name_width = draw.textlength(name, font=font_text)
        price_width = draw.textlength(price, font=font_text)
        available_width = max_width - price_width - 20

        # Перенос строк
        lines = []

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

        # Цена около первой строки
        draw.text((WIDTH - PADDING, y), price, font=font_text, anchor="rs")

        for ln in lines:
            draw.text((PADDING, y), ln, font=font_text, anchor="ls")
            y += font_text.getbbox("T")[3] + LINE_SPACING

        y += 6  # небольшой разделитель

    # =======================================================
    #                 INTERNAL — возврат сразу
    # =======================================================

    if mode == "internal":
        img = img.crop((0, 0, WIDTH, y + 20))
        return img

    # =======================================================
    #         CLIENT/KITCHEN — НИЗ ЧЕКА
    # =======================================================

    y += font_text.getbbox("T")[3] + 10
    draw.line((PADDING, y, WIDTH - PADDING, y), fill=0, width=2)
    y += 80

    # Большой номер заказа
    if mode == "client":
        order_id = request.order_id
    else:
        order_id = request.order_id

    draw.text((WIDTH // 2, y), str(order_id), font=font_big, anchor="mm")
    y += font_big.getbbox("T")[3] + 40

    # Итог только для клиента
    if mode == "client":
        h = font_bold.getbbox("T")[3]
        draw.text((PADDING, y), "Итого:", font=font_bold, anchor="ls")
        draw.text((WIDTH - PADDING, y), f"{request.total} UZS", font=font_bold, anchor="rs")
        y += h + 20

    draw.text((PADDING, y), f"Дата Создания: {date_str}", font=font_text)
    y += font_text.getbbox("T")[3] + 20

    img = img.crop((0, 0, WIDTH, y))
    return img


# ======================== PRINT ========================

def print_receipt(p, request, mode="client"):
    img = generate_receipt(request, mode)
    filename = f"check_{mode}.png"
    img.save(filename)
    print(f"✔ Создан: {filename}")
    p.image(filename)
    p.cut()