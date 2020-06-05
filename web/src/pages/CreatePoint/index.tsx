import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';

import { LeafletMouseEvent } from 'leaflet';
import { Map, TileLayer, Marker } from 'react-leaflet';

import { FiArrowLeft } from 'react-icons/fi';
import './styles.css';

import logo from '../../assets/logo.svg';
import api from '../../services/api';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFReponse {
  sigla: string;
}

interface IBGECityResponse {
  id: number;
  nome: string;
}

const CreatePoint: React.FC = () => {
  const history = useHistory();
  
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);

useEffect(() => {
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    
    setInitialPosition([latitude, longitude]);
  });
}, []);

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    })
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFReponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla);

        setUfs(ufInitials);
      })
  }, [])
  
  useEffect(() => {
    if (selectedUf === '0') return;

    axios
      .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome);

        setCities(cityNames);
      })
  }, [selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }

  function handleInputChagne(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    
    setFormData({ ...formData, [name]: value });
  }

  function handleSelectItem(id: number) {
    const isAlreadySelected = 
      (selectedItems.findIndex(element => element === id) !== -1) ;
    
    if (isAlreadySelected) {
      setSelectedItems(selectedItems.filter(value => value !== id));
      return;
    } 
    
    setSelectedItems([...selectedItems, id]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    };

    await api.post('points', data);

    alert('Ponto de coleta criado');

    history.push('/');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do 
          <br /> 
          ponto de coleta
        </h1>
        
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"  
              id="name"
              onChange={handleInputChagne}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email"
                name="email"  
                id="email"
                onChange={handleInputChagne}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"  
                id="whatsapp"
                onChange={handleInputChagne}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o enderço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                name="uf" 
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                name="city" 
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li 
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : undefined}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
};

export default CreatePoint;