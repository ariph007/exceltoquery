import readXlsxFile from 'read-excel-file'
import { useEffect, useState } from 'react';
import { Alert, Button, Input } from 'antd';
import Modal from 'antd/es/modal/Modal';



function App() {
  const [tableName, setTableName] = useState("")
  const [file, setFile] = useState<FileList>()
  const [datas, setDatas] = useState<string[]>([])


  const fileHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const generateFile = async() =>{
    const fileData = datas.join('\n');
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "migrations.txt";
    link.href = url;
    link.click();
    
  }

  useEffect(() => {
    if (datas.length > 0) {
      generateFile();
    }
  }, [datas]);


  const downloadHandler = () => {
    if (!file) {
      showModal()
    } else {
      let queries: string[] = [];
      readXlsxFile(file![0]).then((rows) => {
        const columnNames = rows[0];
        for (let index = 0; index < rows.length; index++) {
          if (index !== 0) {
            const records = rows[index]
            let query = [];

            query.push(`INSERT INTO ${tableName}`)
            for (let indexColumn = 0; indexColumn < columnNames.length; indexColumn++) {
              const columnName = columnNames[indexColumn].toString().split("||")[0];
              if (indexColumn === 0) {
                query.push("(")
              } else if (indexColumn !== (columnNames.length - 1) || indexColumn !== 0) {
                query.push(", ")
              }
              query.push(columnName)
              if (indexColumn === (columnNames.length - 1)) {
                query.push(") ")
              }
            }
            query.push("VALUES(")
            for (let indexRecord = 0; indexRecord < records.length; indexRecord++) {
              const dataType = columnNames[indexRecord].toString().split("||")[1];

              const record = records[indexRecord];

              if (dataType == "number") {
                query.push("")
                query.push(record)
                if (indexRecord === (records.length - 1)) {
                  query.push(");")
                } else {
                  query.push(",")
                }
              } else if (dataType == "subquery") {
                query.push("(")
                query.push(record)
                if (indexRecord === (records.length - 1)) {
                  query.push("));")
                } else {
                  query.push("),")
                }
              }
              else if (dataType == "string" || !dataType) {
                query.push("'")
                query.push(record)
                if (indexRecord === (records.length - 1)) {
                  query.push("');")
                } else {
                  query.push("',")
                }
              }
            }
            queries.push(query.join(""))
          }
          setDatas(queries)
        }
      })
    }
  }
  return (
    <div className='flex flex-col gap-4 mx-4 my-2 w-full'>
      <p className='text-lg text-blue-500 font-semibold'>Excel To Query</p>
      <input onChange={fileHandler} type="file" id="xls" />
      <div className="flex w-[200px] flex-col gap-2">
        <Input width={100} onChange={(e) => setTableName(e.target.value)} placeholder="table name" />
        <Button disabled={!tableName} onClick={downloadHandler} type="primary">Download Query</Button>
      </div>

      <Modal title="Error" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <p>Oopps...Choose file first</p>
      </Modal>
    </div>
  )
}

export default App
