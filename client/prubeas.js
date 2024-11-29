const CheckComands = (txt)=>{
  const Comandos=['Flor']
  if(txt.includes('/') && txt.includes('(') && txt.includes(')')){
  const Comando={
    Nombre:0,
    Variables:[]
  }
  let C = 0
  let i = 0

  C = txt.split('/')
  C.forEach(v=>{
    if(v.includes('(') && v.includes(')'))Comando.Nombre=v.slice(v[0],v.indexOf('('))
    if(Comandos.includes(Comando.Nombre))return
    i++
  })

  C=C[i].slice(C[i].indexOf('(')+1,C[i].indexOf(')'))
  C=C.split(',')
  i=0
  C.forEach(v => {
    if(v.includes(')')) [v]=v.split(')')
    Comando.Variables[i]=parseInt(v)
    i++
  })
  const msg = txt.replace(`/${Comando.Nombre}(${Comando.Variables})`,'(Flor)')
  return({newMsg:msg,Comando:Comando})
  //console.log(mensaje)
  }
}
const {Comando,msg}=CheckComands('hola /Flor(1,2,20) algo mas')
if(Comando){
  console.log(newMsg)
}