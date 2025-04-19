"use client"
import { useEffect, useState } from "react";

export default function authenticate(){
	const [getSubmitLogin, setSubmitLogin] = useState<boolean>(true)

	const formSubmit = async (form:any) => {
		const username = form.get('userNickname') as string || ''
		const password = form.get('userPassword') as string || ''
		const userData = { username, password }
		if (getSubmitLogin) {
			const res = await fetch('http://localhost:3000/api/users/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData)
			})
			const data = await res.json()
			console.log(res)
			localStorage.setItem('JWT', data.JWT)
		} else {
			const res = await fetch('http://localhost:3000/api/users/createuser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData)
			})
			const data:any = await res.json()
			localStorage.setItem('JWT', data.JWT)
		}
		localStorage.setItem('userNickname', username)
		localStorage.setItem('userPassword', password)
	}
	return (
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
			<form action={formSubmit}>
				<input required type="text" minLength={4} name="userPassword" placeholder="Password"/>
				<input required type="text" minLength={6} name="userNickname" placeholder="Login"/>
				<input type="submit" />
			</form>
		</>
	)
}