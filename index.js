const bodyParser = require("body-parser");
const express = require("express");
const soap = require("soap");
const uuidv4 = require("uuid/v4");

async function main() {
    const port = 3000;
    const app = express();

    const soapClient = await soap.createClientAsync("./DailyInfo.wsdl");
    soapClient.setEndpoint("http://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx");

    app.post("/", bodyParser.json(), (req, res) => {
        const method = req.body.method;
        const body = req.body.body;

        const soapMethod = soapClient[method];
        if (soapMethod == undefined) {
            throw new Error("Wrong method name");
        }

        // Создадим объект для хранения заголовков
        const wsaHeader = {
            MessageID: {
                // В качестве значения для заголовка MessageID сгенерируем случайный UUID
                $value: uuidv4()
            },
            Action: {
                // Для Action передадим имя вызываемого метода, как того требует протокол
                $value: method
            }
        };

        // Очистим заголовки soap-запроса
        soapClient.clearSoapHeaders();
        // Добавим новый заголовк
        soapClient.addSoapHeader(
            wsaHeader,    // объект, в котором хранятся заголовки
            "WSA",        // имя группы заголовков
            "wsa",        // префикс пространства имен
            "http://www.w3.org/2005/08/addressing" // само пространство имен
        );
        
        soapMethod(body, (err, result) => {
            if (err) {
                res.send(err);
                return;
            }
            res.send(JSON.stringify(result));
        });
    });

    app.listen(port, () => console.log(`Test app listening on port ${port}!`));
}

main();
