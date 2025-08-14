import './dashboard.css';
import { FiMessageSquare, FiPlus, FiSearch, FiEdit2 } from 'react-icons/fi';
import Sidebar from "../../components/Sidebar";
import Title from '../../components/Title';
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, limit, startAfter, orderBy, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import Modal from '../../components/Modal';


function Dashboard(){
    const [ tickets, setTickets ] = useState([]); // chamados disponíveis
    const [ loading, setLoading ] = useState(true); // carregamento da página
    const [ isEmpty, setIsEmpty ] = useState(false); // não tem chamados na coleção do firebase
    const [ lastDocs, setLastDocs ] = useState(); // armazena o último chamado no firebase para usar no botão 'buscar mais'
    const [ loadingMore, setLoadingMore ] = useState(false); // clicou no botão 'buscar mais'
    const [ statusFilter, setStatusFilter ] = useState("Todos");
    const [ viewModal, setViewModal ] = useState(false); // manipular o modal de detalhes
    const [ detail, setDetail ] = useState(); // receberá os dados do chamado ao clicar no modal de detalhes
    const [ isFilter, setIsFilter ] = useState(false); // verifica se houve filtragem nos tickets

    const listRef = collection(db, "tickets"); // coleção dos chamados no firebase


    // BUSCA OS 10 DOCUMENTOS AO CARREGAR A PÁGINA
    useEffect(() => {
        async function loadTickets(){
            const q = query(listRef, orderBy('created', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);
            
            await updateStateTickets(querySnapshot);

            setLoading(false);
        }

        loadTickets();

        return () => { }
    }, [])


    // ADICIONA OS CHAMADOS DO FIREBASE NA STATE DOS TICKETS
    async function updateStateTickets(querySnapshot){
        const isCollectionEmpty = querySnapshot.size === 0;

        if (!isCollectionEmpty){
            let lista = [];

            querySnapshot.forEach((doc) => {
                lista.push({
                    id: doc.id,
                    assunto: doc.data().assunto,
                    cliente: doc.data().cliente,
                    created: doc.data().created,
                    createdFormat: format(doc.data().created.toDate(), "dd/MM/yyyy"),
                    status: doc.data().status,
                    complemento: doc.data().complemento,
                    user: doc.data().user,
                })
            })
            
            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]; // ultimo chamado na coleção do firebase (para usar no botão de 'buscar mais')
            setTickets(tickets => [...tickets, ...lista]); // busca todos os chamados disponíveis e ADICIONA todos os novos chamados da lista
            setLastDocs(lastDoc); // atualiza a state com o último chamado do db firebase
        }else{
            setIsEmpty(true);
        }

        setLoadingMore(false);
    }


    // DEFINE A BUSCA A PARTIR DO ÚLTIMO CHAMADO NO FIREBASE
    async function handleMore(){
        setLoadingMore(true);

        const q = query(listRef, orderBy('created', 'desc'), startAfter(lastDocs), limit(10));
        const querySnapshot = await getDocs(q);
        await updateStateTickets(querySnapshot);
    }


    // ATUALIZA A STATE E ADICIONA OS DADOS DO TICKET DENTRO DO MODAL
    function toggleModal(item){
        setViewModal(!viewModal);   
        setDetail(item);
    }


    // BUSCA E MOSTRA APENAS OS CHAMADOS FILTRADOS
    async function handleFilter(e){
        const value = e.target.value;
        setStatusFilter(value);
        setIsFilter(true);
        setTickets([]);

        let q;

        if (value === "Todos") {
            q = query(listRef, orderBy('created', 'desc'), limit(10));
        } else {
            q = query(listRef, where("status", "==", value), orderBy('created', 'desc'), limit(10));
        }

        const querySnapshot = await getDocs(q);
        await updateStateTickets(querySnapshot);
        setLoading(false);
    }


    // AVISA QUE OS CHAMADOS ESTÃO SENDO CARREGADOS
    if (loading){
        return(
            <div>
                <Sidebar/>
                <div className='content'>
                    <Title>
                        <FiMessageSquare size={25}/>
                    </Title>
                    <div className='container dashboard'>
                        <span>Carregando chamados...</span>
                    </div>
                </div>
            </div>
        )
    }


    return(
        <div>
            <Sidebar/>
            <div className="content">
                <Title name="Chamados">
                    <FiMessageSquare size={25}/>
                </Title>

                <>
                    { tickets.length === 0 && isFilter === false ? (
                        <div className='container dashboard'>
                            <span>Nenhum chamado encontrado...</span>
                            <Link className='new' to={"/new"}>
                                <FiPlus color='#FFF' size={20}/>
                                Novo chamado
                            </Link>  
                        </div>) : (
                        <> 
                        <Link className='new' to={"/new"}>
                            <FiPlus color='#FFF' size={20}/>
                            Novo chamado
                        </Link>
                        
                        <div className='filtro'>
                            <label>Status</label>
                            <select name='Filter' value={statusFilter} onChange={handleFilter}>
                                <option value={"Todos"}>Todos</option>
                                <option value={"Aberto"}>Em aberto</option>
                                <option value={"Progresso"}>Em progresso</option>
                                <option value={"Atendido"}>Atendido</option>
                                <option value={"Cancelado"}>Cancelado</option>
                            </select>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th scope='col'>Cliente</th>
                                    <th scope='col'>Assunto</th>
                                    <th scope='col'>Status</th>
                                    <th scope='col'>Cadastrado em</th>
                                    <th scope='col'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((item, index) => {
                                    return(
                                        <tr key={index}>
                                            <td data-label="Cliente">{item.cliente}</td>
                                            <td data-label="Assunto">{item.assunto}</td>
                                            <td data-label="Status">
                                                <span className='badge' style={{ backgroundColor: item.status === 'Aberto' ? 'brown' : item.status === 'Progresso' ? '#0022bbff' : item.status === 'Cancelado' ? '#999' : '#1b8800ff' }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td data-label="Cadastrado">{item.createdFormat}</td>
                                            <td data-label="#">
                                                <button className='btn-action' onClick={ () => toggleModal(item) } style={{ backgroundColor: '#3583f6' }}>
                                                    <FiSearch color='#FFF' size={17}/>
                                                </button>
                                                <Link to={`/new/${item.id}`} className='btn-action' style={{ backgroundColor: '#f6a935' }}>        
                                                    <FiEdit2 color='#FFF' size={17}/>                                   
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        { loadingMore && <h3 className='label-more'>Buscando mais chamados...</h3> } 
                        {!loadingMore && !isEmpty && <button className='btn-more' onClick={handleMore}>Buscar mais</button>}
                        </>
                    )}
                </>
            </div>

            {viewModal && (
                <Modal
                    content={detail}
                    close={ () => setViewModal(!viewModal) }
                />
            )}

        </div>
    )
}

export default Dashboard;