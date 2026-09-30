"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Banknote, ChevronLeft, Delete, LockKeyhole, Printer, RotateCcw, TicketCheck } from "lucide-react";
import { BICHOS } from "@/lib/bichos";
import Link from "next/link";

type Modalidade = "GRUPO" | "DEZENA" | "CENTENA" | "MILHAR" | "DUQUE" | "TERNO";
type Ticket = { codigo:string; modalidade:Modalidade; numeros:string[]; valorPago:string; valorRecebido:string; troco:string; dataHora:string };
const modalidades:Modalidade[] = ["GRUPO","DEZENA","CENTENA","MILHAR","DUQUE","TERNO"];
const limites:Record<Modalidade,number> = { GRUPO:2, DEZENA:2, CENTENA:3, MILHAR:4, DUQUE:2, TERNO:3 };
const quantidades:Record<Modalidade,number> = { GRUPO:1, DEZENA:1, CENTENA:1, MILHAR:1, DUQUE:2, TERNO:3 };
const dinheiro = (valor:number|string) => Number(valor).toLocaleString("pt-BR",{ style:"currency",currency:"BRL" });

export function Terminal() {
  const [modalidade,setModalidade] = useState<Modalidade>("GRUPO");
  const [numeros,setNumeros] = useState<string[]>([]);
  const [digitando,setDigitando] = useState("");
  const [valor,setValor] = useState("5");
  const [recebido,setRecebido] = useState("5");
  const [ticket,setTicket] = useState<Ticket|null>(null);
  const [mensagem,setMensagem] = useState("");
  const [enviando,setEnviando] = useState(false);
  const usaGrupo = modalidade === "GRUPO" || modalidade === "DUQUE" || modalidade === "TERNO";
  const troco = Math.max(0,Number(recebido||0)-Number(valor||0));
  const pronto = numeros.length === quantidades[modalidade] && Number(valor)>0 && Number(recebido)>=Number(valor);
  const tituloNumero = useMemo(() => numeros.length ? numeros.join(" + ") : digitando || "-",[numeros,digitando]);

  function trocarModalidade(nova:Modalidade) { setModalidade(nova); setNumeros([]); setDigitando(""); setMensagem(""); }
  function escolherGrupo(grupo:number) {
    if (!usaGrupo) return;
    const numero=String(grupo);
    setNumeros((atuais)=>atuais.includes(numero)?atuais.filter((n)=>n!==numero):atuais.length<quantidades[modalidade]?[...atuais,numero]:atuais);
  }
  function digitar(tecla:string) {
    if (usaGrupo) return;
    if (tecla === "apagar") { setDigitando((v)=>v.slice(0,-1)); setNumeros([]); return; }
    if (digitando.length >= limites[modalidade]) return;
    const proximo=digitando+tecla;
    if (proximo.length > limites[modalidade]) return;
    setDigitando(proximo);
    setNumeros(proximo.length===limites[modalidade]?[proximo]:[]);
  }
  async function registrar() {    setEnviando(true); setMensagem("");
    try {
      const response=await fetch("/api/pules",{ method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ modalidade,numeros,valorPago:Number(valor),valorRecebido:Number(recebido) }) });
      const data=await response.json();
      if (!response.ok) throw new Error(data.error);
      setTicket(data); setNumeros([]); setDigitando("");
    } catch(error) { setMensagem(error instanceof Error?error.message:"Falha ao registrar."); }
    finally { setEnviando(false); }
  }

  return <main className="flex h-[100dvh] flex-col overflow-hidden md:block md:h-auto md:min-h-[100dvh] md:overflow-y-auto">
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--line)] px-2.5 py-1.5 md:mx-auto md:mb-4 md:max-w-[1500px] md:px-5 md:py-3">
      <div className="min-w-0"><p className="chalk truncate text-lg leading-none text-[var(--yellow)] md:text-4xl">Banca do Bairro</p><p className="mt-0.5 hidden text-xs uppercase tracking-[.16em] text-[var(--muted)] md:block">Terminal do balcão</p></div>
      <Link href="/admin" className="press flex min-h-10 shrink-0 items-center gap-1.5 border border-[var(--line)] px-2.5 text-sm md:min-h-12 md:gap-2 md:px-4"><LockKeyhole size={17}/> <span className="hidden sm:inline">Admin</span></Link>
    </header>

    <div className={`flex min-h-0 flex-1 flex-col gap-1.5 px-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] md:mx-auto md:mb-5 md:max-w-[1500px] md:gap-4 md:px-5 ${usaGrupo?"md:grid md:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px]":"md:mx-auto md:max-w-xl"}`}>
      {usaGrupo&&<section className="panel flex min-h-0 flex-1 flex-col p-1 md:p-4" aria-labelledby="bichos-title">
        <div className="mb-1 flex shrink-0 items-end justify-between gap-2"><h1 id="bichos-title" className="chalk text-lg leading-none md:text-3xl">Escolha o bicho</h1><span className="text-[10px] text-[var(--muted)] md:text-xs">25 grupos</span></div>
        <div className="grid min-h-0 flex-1 auto-rows-[minmax(40px,1fr)] grid-cols-5 gap-1 md:grid-rows-[repeat(5,minmax(92px,auto))] md:gap-2">
          {BICHOS.map(([nome,dezenas,emoji],index)=>{ const grupo=index+1,ativo=numeros.includes(String(grupo))&&usaGrupo; return <button key={nome} type="button" disabled={!usaGrupo} onClick={()=>escolherGrupo(grupo)} aria-pressed={ativo} aria-label={`${grupo} ${nome} ${dezenas}`} className={`press relative flex min-h-0 flex-col items-center justify-center gap-0.5 overflow-hidden border p-0.5 text-center disabled:cursor-default md:items-start md:justify-start md:gap-0.5 md:p-2 md:text-left ${ativo?"border-[var(--yellow)] bg-[var(--yellow)] text-[#16231d]":"border-[var(--line)] bg-black/10"}`}><b className="absolute left-0.5 top-0 text-[8px] font-bold leading-none opacity-60 md:static md:text-xs">{String(grupo).padStart(2,"0")}</b><span className="text-lg leading-none md:text-2xl" aria-hidden="true">{emoji}</span><strong className="w-full truncate text-[9px] font-bold leading-none md:text-sm">{nome}</strong><span className={`hidden text-[10px] md:block ${ativo?"text-[#33463d]":"text-[var(--muted)]"}`}>{dezenas}</span></button>; })}
        </div>
      </section>}

      <aside className={`flex shrink-0 flex-col gap-1.5 ${usaGrupo?"":"min-h-0 flex-1 md:flex-none md:mx-auto md:w-full md:max-w-xl"}`}>
        <section className="wood shrink-0 border border-[#9b6848] p-1 md:p-3"><p className="sr-only">Modalidade</p><div className="grid grid-cols-6 gap-0.5 md:gap-2">{modalidades.map((item)=><button key={item} onClick={()=>trocarModalidade(item)} className={`press flex min-h-9 items-center justify-center border px-0.5 text-[9px] font-bold leading-none tracking-tight md:min-h-12 md:px-2 md:text-xs md:tracking-normal ${modalidade===item?"border-[#fff4d5] bg-[#fff4d5] text-[#432719]":"border-white/30 bg-black/10 text-[#fff4d5]"}`}>{item}</button>)}</div></section>

        <section className={`panel p-1 md:flex-none md:p-3 ${usaGrupo?"shrink-0":"flex min-h-0 flex-1 flex-col"}`}>
          <div className="grid shrink-0 grid-cols-[1fr_auto] items-stretch gap-1.5">
            <output className="flex min-h-10 items-center justify-center overflow-hidden border border-dashed border-[var(--line)] bg-black/20 px-2 text-center text-xl font-bold tracking-[.12em] text-[var(--yellow)] md:min-h-16 md:text-3xl">{tituloNumero}</output>
            <button className="press flex min-h-10 flex-col items-center justify-center gap-0.5 border border-[var(--line)] px-2.5 text-[10px] font-bold text-[var(--yellow)] md:min-h-16 md:gap-1 md:text-xs" onClick={()=>{setNumeros([]);setDigitando("");}}><RotateCcw size={15}/> Limpar</button>
          </div>
          {usaGrupo?<p className="mt-1 shrink-0 text-center text-[10px] leading-none text-[var(--muted)] md:mt-3 md:text-xs">Toque em {quantidades[modalidade]} grupo(s) na grade.</p>:<Numpad onKey={digitar}/>}
        </section>

        <section className="panel shrink-0 p-1 md:p-3">
          <div className="grid grid-cols-3 items-end gap-1.5 md:gap-3">
            <label className="text-[10px] leading-none text-[var(--muted)] md:text-xs">Aposta<input aria-label="Valor da aposta" inputMode="decimal" value={valor} onChange={(e)=>setValor(e.target.value)} className="mt-1 min-h-10 w-full border border-[var(--line)] bg-black/20 px-1.5 text-base text-white md:mt-1 md:min-h-12 md:px-3 md:text-lg"/></label>
            <label className="text-[10px] leading-none text-[var(--muted)] md:text-xs">Recebido<input aria-label="Dinheiro recebido" inputMode="decimal" value={recebido} onChange={(e)=>setRecebido(e.target.value)} className="mt-1 min-h-10 w-full border border-[var(--line)] bg-black/20 px-1.5 text-base text-white md:mt-1 md:min-h-12 md:px-3 md:text-lg"/></label>
            <div className="flex flex-col items-center justify-center pb-1 text-center md:py-3"><span className="flex items-center gap-1 text-[10px] leading-none text-[var(--muted)] md:text-xs"><Banknote size={13}/> Troco</span><strong className="mt-1 text-sm leading-none text-[var(--yellow)] md:text-xl">{dinheiro(troco)}</strong></div>
          </div>
          <button disabled={!pronto||enviando} onClick={registrar} className="press mt-1.5 flex min-h-12 w-full items-center justify-center gap-2 bg-[var(--yellow)] px-3 text-sm font-bold text-[#15231d] disabled:cursor-not-allowed disabled:opacity-40 md:mt-4 md:min-h-14 md:gap-3 md:text-base"><TicketCheck/>{enviando?"REGISTRANDO...":"EMITIR PULE"}</button>
          <p aria-live="polite" className="min-h-0 truncate text-center text-xs leading-tight text-[#ff9f8f] empty:hidden md:mt-2 md:text-sm">{mensagem}</p>
        </section>
      </aside>
    </div>{ticket&&<Receipt ticket={ticket} onClose={()=>setTicket(null)}/>} </main>;
}

function Numpad({onKey}:{onKey:(key:string)=>void}) { return <div className="mt-1.5 grid min-h-0 flex-1 grid-cols-3 gap-1.5 md:mt-3 md:flex-none md:grid-cols-3 md:gap-2">{["1","2","3","4","5","6","7","8","9","00","0","apagar"].map((key)=><button key={key} onClick={()=>onKey(key)} aria-label={key==="apagar"?"Apagar último dígito":key} className="press flex min-h-11 items-center justify-center border border-[var(--line)] bg-white/5 text-lg font-bold md:min-h-14 md:text-xl">{key==="apagar"?<Delete/>:key}</button>)}</div>; }
function Receipt({ticket,onClose}:{ticket:Ticket;onClose:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();},[]);
  return <dialog ref={ref} onCancel={onClose} aria-label="Pule emitida" className="fixed inset-0 z-50 m-auto max-h-none max-w-none bg-transparent p-4 backdrop:bg-black/75"><div className="receipt w-[min(360px,calc(100vw-2rem))] p-6 font-mono"><div className="border-b-2 border-dashed border-black pb-4 text-center"><p className="text-2xl font-bold">BANCA DO BAIRRO</p><p className="text-xs">Pule registrada</p></div><dl className="my-4 space-y-2 text-sm"><div className="flex justify-between"><dt>Código</dt><dd className="font-bold">{ticket.codigo}</dd></div><div className="flex justify-between"><dt>Modalidade</dt><dd>{ticket.modalidade}</dd></div><div className="flex justify-between"><dt>Número(s)</dt><dd>{ticket.numeros.join(" + ")}</dd></div><div className="flex justify-between"><dt>Aposta</dt><dd>{dinheiro(ticket.valorPago)}</dd></div><div className="flex justify-between"><dt>Recebido</dt><dd>{dinheiro(ticket.valorRecebido)}</dd></div><div className="flex justify-between"><dt>Troco</dt><dd>{dinheiro(ticket.troco)}</dd></div></dl><p className="border-y-2 border-dashed border-black py-3 text-center text-xs">{new Date(ticket.dataHora).toLocaleString("pt-BR")}</p><p className="mt-3 text-center text-[10px]">Guarde este comprovante.</p><div className="no-print mt-5 grid grid-cols-2 gap-2"><button autoFocus onClick={onClose} className="press flex min-h-12 items-center justify-center gap-2 border border-black"><ChevronLeft size={18}/> Voltar</button><button onClick={()=>window.print()} className="press flex min-h-12 items-center justify-center gap-2 bg-black text-white"><Printer size={18}/> Imprimir</button></div></div></dialog>;
}
