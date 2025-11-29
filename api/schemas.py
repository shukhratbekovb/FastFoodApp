from pydantic import BaseModel


class Product(BaseModel):
    name: str
    price: float
    quantity: int

class PrintSchema(BaseModel):
    products: list[Product]
    total: float
    order_id: int