# data-prime

Необходимо реализовать анимированный компонент “Сфера” в соответствии с изображением по ссылке: http://dtprm.ru/sphere.png. 
Это вращающаяся сфера, состоящая из точек, каждая точка — это элемент данных из JSON-файла. Структура файла имеет вид:

{items: [
{title: “Google”, link: “https://google.com”, filled: false}
]}

Тестовый файл сгенерировать с помощью https://www.json-generator.com.
Сфера должна иметь настройку на количество отображаемых точек и количество отображаемых подписей. 
Клик на подпись ведет к переходу по ссылке. При наведении на сферу вращение должно останавливаться.