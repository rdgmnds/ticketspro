import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../contexts/auth';

import './signin.css';
import logo from '../../assets/images/logo.png';

function SignIn(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signIn, loadingAuth } = useContext(AuthContext);

    async function handleSignIn(e){
        e.preventDefault()

        if (email !== "" && password !== ""){
            await signIn(email, password);
        }else{
            toast.warning("Preencha todos os campos!")
        }

      }  

    return(
        <div className='signin-container'>
            <div className='login'>
                <div className='login-area'>
                    <img src={logo} alt='Logo do sistema de chamados'></img>
                </div>

                    <form className='form-signin' onSubmit={handleSignIn}>
                        <h1>Entrar</h1>
                        <input
                            type='text'
                            placeholder='seu@email.com'
                            value={email}
                            onChange={ (e) => setEmail(e.target.value) }
                        />

                        <input
                            type='password'
                            placeholder='**********'
                            value={password}
                            onChange={ (e) => setPassword(e.target.value) }
                        />

                        <button type='submit'>
                            {loadingAuth ? "Carregando..." : "Acessar"}
                        </button>

                        <Link to={"/signup"}>Não tem uma conta? Cadastre-se aqui!</Link>
                    </form>
                
            </div>
        </div>
    )
}

export default SignIn;