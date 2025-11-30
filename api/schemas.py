from pydantic import BaseModel


class Product(BaseModel):
    name: str
    price: float
    quantity: int

class PrintSchema(BaseModel):
    products: list[Product]
    total: float
    order_id: int

class LargePrintSchema(BaseModel):
    products: list[Product]
    total_price: float
    total_orders: int