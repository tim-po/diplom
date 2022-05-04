import {useEffect, useState} from "react";
import {SPECIALIZATIONS} from '../specialisations'
import {specializationJobs} from '../specializationJobs'
import {Box, Checkbox, Chip, Link, ListItemText, MenuItem, OutlinedInput, Select, TextField} from "@mui/material";


const flags = {
  "official": "Официальное трудоустройство",
  "living": "Проживание",
  "vacation": "Оплачиваемый отпуск",
  "coworkers": "Дружный коллектив",
  "office": "Достойный офис",
  "education": "Обучение",
  "salary": "Стабильная заработная плата",
  "location": "Расположение",
  "extra": "Дополнительные выплаты",
  "growth": "Возможность развиваться",
  "tasks": "Интересные задачи",
  "dms": "ДМС",
  "social": "Социальный пакет",
  "discount": "Корпоративные скидки",
  "hours": "График",
  "disko": "Мероприятия",
  "food": "Питание",
  "remote": "Удаленная работa",
  "drive": "Проезд",
  "hotel": "Путевка",
  "tech": "Оборудование",
  "clothes": "Одежда",
  "sport": "Спорт"
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Home = () => {
  const [jobsById, setJobsById] = useState({})
  const [aras, setAreas] = useState({})
  const [allSpecks, setAllSpecks] = useState([])

  const [selectedSpec, setSelectedSpec] = useState(undefined)
  const [selectedFlags, setSelectedFlags] = useState([])
  const [selectedAreas, setSelectedAreas] = useState([])

  const [searchString, setSearchString] = useState('')

  const [filtered, setfiltered] = useState([])

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedFlags(value)
  };

  const handleChangeArea = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedAreas(value)
  };

  function getFilteredJobs(){
    let professions = Object.keys(jobsById)

    professions = professions.filter(prof => {
      const fullProf = jobsById[prof]
      let doesContainAll = true
      selectedAreas.forEach(area => {
        if(fullProf.area && fullProf.area.id !== area){
          doesContainAll = false
        }
      })

      selectedFlags.forEach(flag => {
        if(!fullProf[flag]){
          doesContainAll = false
        }
      })

      if(selectedSpec !== 'Любая' && selectedSpec !== undefined && fullProf.specializations){
        if(!fullProf.specializations.filter(sp => sp.id === selectedSpec).length) {
          doesContainAll = false
        }
      }

      const shouldCheckName = searchString !== '' && fullProf.name
      if(shouldCheckName && !fullProf.name.includes(searchString)){
        doesContainAll = false
      }

      return doesContainAll
    })

    console.log(professions.length)

    setfiltered(professions)
  }

  useEffect(()=>{
    getFilteredJobs()
  }, [searchString, selectedAreas, selectedFlags, selectedSpec, jobsById])

  async function getJobs(){

    let allSpecs = []
    let allSpecIds = []

    SPECIALIZATIONS.forEach((speck)=>{
      allSpecs = [...allSpecs, ...(speck.specializations)]
      allSpecIds = [...allSpecIds, ...(speck.specializations.map(sp => sp.id))]
    })

    setAllSpecks(allSpecs)

    let newJobs = {}
    let newJobsById = {}
    let areas = {}

    for(let j = 0; j < allSpecIds.length; j++){
      const specId = allSpecIds[j]
      // @ts-ignore
      const jobs = specializationJobs[specId] || []

      for(let i = 0; i < jobs.length; i++){
        const jobPath = `./docs/specialization/${specId}/${jobs[i]}`

        // const data = require(jobPath);
        // console.log(data)
        const response = await fetch(jobPath)
        const data = await response.json()
        newJobsById[data.id] = data
        if(data.area){
          areas = {...areas, [data.area.id]: data.area}
        }
      }
    }

    setAreas(areas)
    setJobsById(newJobsById)
    console.log(newJobsById)
  }
  useEffect(()=>{
    getJobs()
  },[])

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '90%', alignItems: 'center'}}>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={selectedSpec ? selectedSpec : 'Любая'}
        onChange={(event) => {setSelectedSpec(event.target.value)}}
        label="Специализация"
        style={{minWidth: 600, marginBottom: 20, marginTop: 40}}
      >
        <MenuItem
          key={'undefined'}
          value={'Любая'}
        >
          Любая
        </MenuItem>
        {allSpecks.map(spec => (
          <MenuItem
            key={spec.id}
            value={spec.id}
          >
            {spec.name}
          </MenuItem>
        ))}
      </Select>

      <Select
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        value={selectedFlags}
        onChange={(handleChange)}
        input={<OutlinedInput label="Теги" />}
        renderValue={(selected) => selected.map(item => flags[item]).join(', ')}
        MenuProps={MenuProps}
        label="Теги"
        style={{minWidth: 600, marginBottom: 20}}
      >
        {Object.keys(flags).map((key) => (
          <MenuItem key={key} value={key}>
            <Checkbox checked={selectedFlags.indexOf(key) > -1} />
            <ListItemText primary={flags[key]} />
          </MenuItem>
        ))}
      </Select>

      <Select
        labelId="demo-multiple-checkbox-label"
        id="demo-multiple-checkbox"
        multiple
        value={selectedAreas}
        onChange={(handleChangeArea)}
        input={<OutlinedInput label="Регион" />}
        renderValue={(selected) => selected.map(item => aras[item].name).join(', ')}
        MenuProps={MenuProps}
        label="Регион"
        style={{minWidth: 600, marginBottom: 20}}
      >
        {Object.keys(aras).map((key) => (
          <MenuItem key={key} value={key}>
            <Checkbox checked={selectedAreas.indexOf(key) > -1} />
            <ListItemText primary={aras[key].name} />
          </MenuItem>
        ))}
      </Select>

      <TextField id="outlined-basic" label="Outlined" variant="outlined" value={searchString} onChange={(ev) => setSearchString(ev.target.value)} />

      {filtered.slice(0, 100).map(profId => {
        const fullProf = jobsById[profId]
        if(!fullProf){
          return null
        }
        return(
          <div style={{marginTop: 20, marginBottom: 20, display: "flex", alignItems: 'flex-start', flexDirection: 'column'}}>
            <div>
              {fullProf.name}
            </div>
            {fullProf.area &&
            <div>
              {fullProf.area.name}
            </div>
            }
            {fullProf.specializations && fullProf.specializations.map(spec => <span>{spec.name},</span>)}
            <Link href={fullProf.alternate_url} >
              посмотреть вакансию
            </Link>
          </div>
        )
      })}

    </div>
  )
}

export default Home
