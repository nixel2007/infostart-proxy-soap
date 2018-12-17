// express – фреймворк для построения веб-приложений
const express = require('express');
// Преобразователь тела сообщения к объекту JavaScript. Мы его будем
// использовать для автопреобразования сообщения с Content-Type
// application/json из собственно JSON в объект.
const bodyParser = require("body-parser");
// Реализация soap-сервера и soap-клиента
const soap = require("soap");
// Генератор UUID
const uuidv4 = require("uuid/v4");

// Объявление главной функции.
async function main() {
    // Порт, который будет слушать веб-сервер
    const port = 3000;
    // Создание экземпляра веб-приложения
    const app = express();

    // создание soap-клиента на базе предварительно скачанной wsdl.
    // В качестве параметра может выступать как адрес к файлу на диске,
    // так и URL, по которому этот WSDL можно получить (прямо как WS-Ссылка)
    const soapClient = await soap.createClientAsync("./DailyInfo.wsdl");
    soapClient.setEndpoint("http://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx");

    // Указание реагировать на POST-запрос
    app.post(
        "/",                // по «пустому» ресурсу
        bodyParser.json(),  // с автоматическим преобразованием json-содержимого
        (req, res) => {     // и телом обработчика
        
        // Десериализованное тело запроса доступно в переменной req.body
        // В случае корректного запроса req.body будет содержать два свойства:
        // method и body
        const method = req.body.method;
        const body = req.body.body;

        // Попробуем получить указатель на функцию для вызова soap-метода
        const soapMethod = soapClient[method];
        // Если метод не нашелся, выбросим исключение
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

        // Если все хорошо, вызовем soap-метод, передав ему в качестве параметров
        // тело сообщения и обработчик результата вызова
        soapMethod(body, (err, result) => {
            // В случае возникновения ошибки вернем ее клиенту.
            if (err) {
                res.send(err);
                return;
            }
            // Если все хорошо, переведем ответ в JSON и вернем клиенту.
            res.send(JSON.stringify(result));
        });

    });

    // Запуск приложения – указание слушать порт
    // и выводить сообщение в консоль по готовности
    app.listen(port, () => console.log(`Test app listening on port ${port}!`));

}

// Точка входа
main();
