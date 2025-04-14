import React, { useState } from 'react';

function FormParser() {
  const [input, setInput] = useState("");
  const [outputs, setOutputs] = useState({ tableRow: "", directorMsg: "", tableCopy: "" });

  function parseForm(text) {
    function extract(regex) {
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    }

    const data = {
      email: extract(/Электронная почта:\s*(.+)/),
      rules_agreement: extract(/ознакомился.*с ними:\s*(.+)/),
      full_name: extract(/Ваше ФИО:\s*(.+)/),
      phone: extract(/Ваш контактный номер телефона:\s*(.+)/),
      animal_type: extract(/Вид животного:\s*(.+)/),
      animal_count: extract(/Количество животных.*:\s*(.+)/),
      health_status: extract(/Состояние здоровья.*:\s*(.+)/),
      shelter_name: extract(/Название приюта.*:\s*(.+)/),
      pickup_address: extract(/местонахождения животного:\s*(.+)/),
      destination_address: extract(/пункта назначения:\s*(.+)/),
      return_needed: extract(/Понадобится ли транспортировка.*:\s*(.+)/),
      trip_date: extract(/Дата поездки[^\d]*(\d{4}-\d{2}-\d{2})/),
      pickup_time: extract(/подача\s*([0-9:]+)/),
      arrival_time: extract(/прием\s*([0-9:]+)/),
      trip_purpose: extract(/Цель поездки:\s*(.+)/),
      car_reaction: extract(/переносит поездку.*:\s*(.+)/),
      socialization: extract(/степень социализации.*:\s*(.+)/),
      responsibility_agreement: extract(/я подтверждаю.*:\s*(Да|Нет)/),
      data_policy_agreement: extract(/согласие.*:\s*(Да|Нет)/),
    };

    const tableRow = [
      data.trip_date,
      data.email,
      data.rules_agreement,
      data.full_name,
      data.phone,
      data.animal_type,
      data.animal_count,
      data.health_status,
      data.shelter_name,
      `${data.full_name}, ${data.phone}`,
      data.pickup_address,
      data.destination_address,
      `подача ${data.pickup_time}, прием ${data.arrival_time}`,
      data.trip_purpose,
      data.car_reaction,
      data.socialization,
      data.responsibility_agreement,
      data.data_policy_agreement,
      data.return_needed
    ].join("\t");

    const directorMsg = `Катя, поступила заявка на ${data.trip_date}\nАдрес подачи: ${data.pickup_address}\nВид животного: ${data.animal_type}\nПункт назначения: ${data.destination_address}\nЦель поездки: ${data.trip_purpose}\nВремя подачи: ${data.pickup_time}\nВремя прибытия: ${data.arrival_time}\nПоездка туда и обратно: ${data.return_needed}\nДополнительная информация:\nКуратор - ${data.full_name}`;

    const tableCopy = `Дата: ${data.trip_date.split('-').reverse().join('.')}\nВремя подачи: ${data.pickup_time}\nАдрес подачи: ${data.pickup_address}\nКонтактное лицо, тел.: ${data.phone}, ${data.full_name}\nВид животного: ${data.animal_type}\n\nПункт назначения: ${data.destination_address}\nВремя прибытия: ${data.arrival_time}\nОсобые отметки: Поездка туда и обратно: ${data.return_needed}\n${data.socialization}`;

    setOutputs({ tableRow, directorMsg, tableCopy });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Скопировано в буфер обмена!");
    });
  }

  return (
    <div className="p-6 space-y-6">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Вставьте сюда текст заявки"
        rows={12}
        style={{ width: "100%", padding: "10px" }}
      />
      <button
        onClick={() => parseForm(input)}
        style={{ padding: "10px 20px", cursor: "pointer", marginTop: "10px" }}
      >
        Обработать заявку
      </button>

      <div>
        <h3 className="font-semibold">Табличная строка:</h3>
        <textarea value={outputs.tableRow} readOnly rows={3} style={{ width: "100%", padding: "10px" }} />
        <button onClick={() => copyToClipboard(outputs.tableRow)} style={{ marginTop: "5px" }}>📋 Копировать</button>
      </div>

      <div>
        <h3 className="font-semibold">Сообщение директору:</h3>
        <textarea value={outputs.directorMsg} readOnly rows={8} style={{ width: "100%", padding: "10px" }} />
        <button onClick={() => copyToClipboard(outputs.directorMsg)} style={{ marginTop: "5px" }}>📋 Копировать</button>
      </div>

      <div>
        <h3 className="font-semibold">Заявка для таблицы:</h3>
        <textarea value={outputs.tableCopy} readOnly rows={8} style={{ width: "100%", padding: "10px" }} />
        <button onClick={() => copyToClipboard(outputs.tableCopy)} style={{ marginTop: "5px" }}>📋 Копировать</button>
      </div>
    </div>
  );
}

export default FormParser;
