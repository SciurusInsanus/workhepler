import React, { useState } from 'react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function FormParser() {
  const [input, setInput] = useState("");
  const [outputs, setOutputs] = useState({ tableRow: "", directorMsg: "", tableCopy: "" });
  const [data, setData] = useState({});
  const [manualPickupTime, setManualPickupTime] = useState("");
  const [manualArrivalTime, setManualArrivalTime] = useState("");

  function parseForm(text) {
    function extract(regex) {
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    }

    const extractedData = {
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
      pickup_time: manualPickupTime || extract(/подача\s*([0-9:]+)/),
      arrival_time: manualArrivalTime || extract(/прием\s*([0-9:]+)/),
      trip_purpose: extract(/Цель поездки:\s*(.+)/),
      car_reaction: extract(/переносит поездку.*:\s*(.+)/),
      socialization: extract(/степень социализации.*:\s*(.+)/),
      responsibility_agreement: extract(/я подтверждаю.*:\s*(Да|Нет)/),
      data_policy_agreement: extract(/согласие.*:\s*(Да|Нет)/),
    };

    setData(extractedData);

    const tableRow = [
      extractedData.trip_date,
      extractedData.email,
      extractedData.rules_agreement,
      extractedData.full_name,
      extractedData.phone,
      extractedData.animal_type,
      extractedData.animal_count,
      extractedData.health_status,
      extractedData.shelter_name,
      `${extractedData.full_name}, ${extractedData.phone}`,
      extractedData.pickup_address,
      extractedData.destination_address,
      `подача ${extractedData.pickup_time}, прием ${extractedData.arrival_time}`,
      extractedData.trip_purpose,
      extractedData.car_reaction,
      extractedData.socialization,
      extractedData.responsibility_agreement,
      extractedData.data_policy_agreement,
      extractedData.return_needed
    ].join("\t");

    const directionText = extractedData.return_needed === "Да"
      ? "Поездка туда и обратно"
      : "Поездка в один конец";

    const directorMsg = `Катя, поступила заявка на ${extractedData.trip_date}
Адрес подачи: ${extractedData.pickup_address}
Вид животного: ${extractedData.animal_type}
Пункт назначения: ${extractedData.destination_address}
Цель поездки: ${extractedData.trip_purpose}
Время подачи: ${extractedData.pickup_time}
Время прибытия: ${extractedData.arrival_time}
Поездка туда и обратно: ${extractedData.return_needed}
Дополнительная информация:
Куратор - ${extractedData.full_name}`;

    const tableCopy = `Дата: ${extractedData.trip_date.split('-').reverse().join('.')}
Время подачи: ${extractedData.pickup_time}
Адрес подачи: ${extractedData.pickup_address}
Контактное лицо, тел.: ${extractedData.phone}, ${extractedData.full_name}
Вид животного: ${extractedData.animal_type}

Пункт назначения: ${extractedData.destination_address}
Время прибытия: ${extractedData.arrival_time}
Особые отметки: ${directionText}
${extractedData.socialization}`;

    setOutputs({ tableRow, directorMsg, tableCopy });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Скопировано в буфер обмена!");
    });
  }

  function generateExcel() {
    const tripDirection = data.return_needed === "Да"
      ? "Поездка туда и обратно"
      : "Поездка в один конец";

    const rows = [
      ["Дата", data.trip_date?.split("-").reverse().join(".") || ""],
      ["Время подачи", data.pickup_time],
      ["Адрес подачи", data.pickup_address],
      ["Контактное лицо, тел.", `${data.phone}, ${data.full_name}`],
      ["", ""],
      ["Вид животного", data.animal_type],
      ["", ""],
      ["Пункт назначения", data.destination_address],
      ["Время прибытия", data.arrival_time],
      ["Особые отметки", `${tripDirection}\n${data.socialization}`],
      ["", ""],
      ["Комментарии водителя:", ""]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 60 }];

    const borderStyle = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    };

    rows.forEach((row, i) => {
      const cellA = `A${i + 1}`;
      const cellB = `B${i + 1}`;

      worksheet[cellA] = worksheet[cellA] || { t: "s", v: "" };
      worksheet[cellB] = worksheet[cellB] || { t: "s", v: "" };

      if (row[0]) worksheet[cellA].s = { font: { bold: true } };

      worksheet[cellA].s = {
        ...(worksheet[cellA].s || {}),
        border: borderStyle
      };

      worksheet[cellB].s = {
        ...(worksheet[cellB].s || {}),
        border: borderStyle,
        alignment: { wrapText: true }
      };

      if (row[0] === "" && row[1] === "") {
        worksheet[cellA].s.fill = { fgColor: { rgb: "EDEDED" } };
        worksheet[cellB].s.fill = { fgColor: { rgb: "EDEDED" } };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Заявка");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const fileName = `Заявка_${(data.trip_date || "дата").replace(/\./g, "-")}.xlsx`;
    saveAs(blob, fileName);
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

      <div className="flex gap-4">
        <input
          type="time"
          value={manualPickupTime}
          onChange={(e) => setManualPickupTime(e.target.value)}
          placeholder="Время подачи"
        />
        <input
          type="time"
          value={manualArrivalTime}
          onChange={(e) => setManualArrivalTime(e.target.value)}
          placeholder="Время прибытия"
        />
      </div>

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
        <button onClick={() => copyToClipboard(outputs.tableCopy)} style={{ marginTop: "5px", marginRight: "10px" }}>📋 Копировать</button>
        <button onClick={generateExcel} style={{ marginTop: "5px" }}>📄 Скачать как Excel</button>
      </div>
    </div>
  );
}

export default FormParser;
