"use client"
import { useEffect, useState } from "react";
import "./globals.css";
export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  const [getShowSite, setShowSite] = useState<boolean>(false)
  const [getSubmitLogin, setSubmitLogin] = useState<boolean>(false)
	useEffect(()=>{
		setShowSite(!!localStorage.getItem("userNickname"))
		console.log(localStorage.getItem("userNickname"))
	}, [])
	return (
    <html lang="en">
			<body>
			<div className="main_background"></div>
			{
				getShowSite ?
				<>
					{children}
				</>
				:
				<>
				{
					getSubmitLogin ?
					<div>Login</div>:<div>Register</div>
				}
					<button onClick={() => setSubmitLogin(!getSubmitLogin)}>
						{
							getSubmitLogin ? 'switch to Register': 'switch to Login'
						}
					</button>
					<form action={async (form) => {
						const username = form.get('userNickname') as string || ''
						const password = form.get('userPassword') as string || ''
						const userData = { username, password }
						console.log(userData)
						if (getSubmitLogin) {
							const res = await fetch('http://localhost:3000/api/users/login', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(userData)
							})
							const data = await res.json()
							localStorage.setItem('JWT', data.JWT)
							localStorage.setItem('userNickname', username)
							localStorage.setItem('userPassword', password)
						} else {
							const res = await fetch('http://localhost:3000/api/users/createuser', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(userData)
							})
							const data = await res.json()
							localStorage.setItem('JWT', data.JWT)
							localStorage.setItem('userNickname', username)
							localStorage.setItem('userPassword', password)
						}
						setShowSite(true)
						}}>
						<input required type="text" name="userPassword" placeholder="Password"/>
						<input required type="text" name="userNickname" placeholder="Login"/>
						<input type="submit" />
					</form>
				</>
			}
			</body>			
    </html>
  );
}
