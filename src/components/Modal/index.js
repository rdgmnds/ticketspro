import './modal.css';
import { FiX } from 'react-icons/fi';

function Modal({ content, close }){

    return(
        <div className='modal'>
            <div className='container'>
                <button className='btn-close' onClick={close}>
                    <FiX size={25} color='#FFF'/>
                </button>

                <main>
                    <h2>Detalhes do chamado</h2>
                    <hr/>

                    <div className='row'>
                        <span>
                        Cliente: <i>{content.cliente}</i>
                        </span>
                    </div>

                    <div className='row'>
                        <span>
                            Assunto: <i>{content.assunto}</i>
                        </span>
                    </div>

                    <div className='row'>
                        <span>
                            Status: <i className='badge-status' style={{ backgroundColor: content.status === 'Aberto' ? 'brown' : content.status === 'Progresso' ? '#0022bbff' : '#1b8800ff' }}>
                                        {content.status}
                                    </i>
                            Cadastrado em: <i>{content.createdFormat}</i>
                        </span>
                    </div>

                    <div className='row'>
                        <span>
                            Criador: <i>{content.user}</i>
                        </span>
                    </div>

                    {content.complemento !== "" && (
                        <>
                            <h3>Complemento:</h3>
                            <p>
                                {content.complemento}
                            </p>
                        </>
                    )}

                </main>
            </div>
        </div>
    )
}

export default Modal;