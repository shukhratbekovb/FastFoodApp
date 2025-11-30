from escpos.printer import Network, Usb
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from schemas import PrintSchema, LargePrintSchema

from printer import print_receipt

app = FastAPI()
IP = "192.168.0.50"


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
    p = Network(IP, timeout=10)
    print_receipt(p, request, "client")
    print_receipt(p, request, "kitchen")
    p.close()

@app.post("/print/report")
async def print_report(
        request: LargePrintSchema
):
    p = Network(IP, timeout=10)
    print_receipt(p, request, "internal")
    p.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)