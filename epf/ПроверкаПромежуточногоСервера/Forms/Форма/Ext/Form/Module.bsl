&НаСервереБезКонтекста
Процедура ВыполнитьЗапросНаСервере()
	
	// Создадим тело нашего запроса - параметры вызываемого soap-метода
	ТелоЗапроса = Новый Структура;
	ТелоЗапроса.Вставить("On_date", Дата(2018, 1, 1));
	
	// Сериализуем его в JSON
	ТекстСообщения = СериализоватьВJSON(ТелоЗапроса); 

	// Проверим, что полученный JSON удовлетворяет XSD
	
	// Если бы у данного свойства был бы выделенный "тип объекта", 
	// то мы бы могли получить тип проще...
	//ТипXDTO = ФабрикаXDTO.Тип(Метаданные.ПакетыXDTO.ПакетXDTO1.ПространствоИмен, "GetCursOnDate");
	
	КорневыеСвойства = ФабрикаXDTO.Пакеты.Получить(Метаданные.ПакетыXDTO.ПакетXDTO1.ПространствоИмен).КорневыеСвойства;
	СвойствоЗапросКурсовНаДату = КорневыеСвойства.Получить("GetCursOnDate");
	ТипXDTO = СвойствоЗапросКурсовНаДату.Тип;
	
	ЧтениеJSON = Новый ЧтениеJSON;
	ЧтениеJSON.УстановитьСтроку(ТекстСообщения);
	
	// Если здесь не выдалось исключения, значит, пакет корректен и его можно отправлять. 
	ФабрикаXDTO.ПрочитатьJSON(ЧтениеJSON, ТипXDTO);	
	
	// Создадим верхнеуровневую структуру, принимаемую промежуточным сервером
	СтруктураЗапроса = Новый Структура;
	СтруктураЗапроса.Вставить("method", "GetCursOnDate");
	СтруктураЗапроса.Вставить("body", ТелоЗапроса);
	
	// Сериализуем его в JSON для последующей отправки
	ТекстСообщения = СериализоватьВJSON(СтруктураЗапроса); 
	                                               	
	// Создадим новое соединение с промежуточным сервером
	Хост = "localhost";
	Порт = 3000;
	Таймаут = 30;
	Соединение = Новый HTTPСоединение(Хост, Порт, , , , Таймаут);	
	
	// "Корневой" адрес ресурса, как мы его объявили в app.post
	Ресурс = "/";
	
	// Обязательно передаем тип содержимого для работы преобразователя body-parser
	ЗаголовкиЗапроса = Новый Соответствие();
	ЗаголовкиЗапроса.Вставить("Content-type", "application/json");
	
	// Создаем и отправляем запрос
	Запрос = Новый HTTPЗапрос(Ресурс, ЗаголовкиЗапроса);
	Запрос.УстановитьТелоИзСтроки(ТекстСообщения);
	
	Ответ = Соединение.ОтправитьДляОбработки(Запрос);	
	
	ТелоОтвета = Ответ.ПолучитьТелоКакСтроку();
	
	// Десериализуем ответ сервиса из JSON в объект XDTO
	ЧтениеJSON = Новый ЧтениеJSON;
	ЧтениеJSON.УстановитьСтроку(ТелоОтвета);
	
	ТипXDTO = ФабрикаXDTO.Тип(Метаданные.ПакетыXDTO.ПакетXDTO1.ПространствоИмен, "GetCursOnDateResponse");
	Данные = ФабрикаXDTO.ПрочитатьJSON(ЧтениеJSON, ТипXDTO);
	
КонецПроцедуры

&НаСервереБезКонтекста
Функция СериализоватьВJSON(Объект)
	Запись = Новый ЗаписьJSON;
    Запись.УстановитьСтроку();
	
	ЗаписатьJSON(Запись, Объект);
	ТекстСообщения = Запись.Закрыть(); 
	
	Возврат ТекстСообщения;
КонецФункции

&НаКлиенте
Процедура ВыполнитьЗапрос(Команда)
	ВыполнитьЗапросНаСервере();
КонецПроцедуры
