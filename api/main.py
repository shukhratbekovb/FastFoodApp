from escpos.printer import Network
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from schemas import PrintSchema

from printer import print_receipt

app = FastAPI()
IP = "192.168.0.50"
p = Network(IP)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post(
    "/print"
)
async def print_check(
        request: PrintSchema
):
    print_receipt(p, request, "client")
    print_receipt(p, request, "kitchen")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)