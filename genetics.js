export const EXAMPLE='ATGGCTGAATTTCCGAAGTAA';
export function validate(s){if(typeof s!=='string'||!s.length||s.length>600||/[^ATCG]/i.test(s))throw Error('Use de 1 a 600 bases A, T, C ou G, sem espaços.');return s.toUpperCase()}
export const complement=s=>[...validate(s)].map(b=>({A:'T',T:'A',C:'G',G:'C'})[b]).join('');
export const reverseComplement=s=>[...complement(s)].reverse().join('');
export function stats(s){s=validate(s);const counts=Object.fromEntries([... 'ATCG'].map(b=>[b,[...s].filter(x=>x===b).length]));return {length:s.length,...counts,gc:100*(counts.G+counts.C)/s.length}}
export const transcribe=(s,mode='coding')=>(mode==='template'?reverseComplement(s):validate(s)).replaceAll('T','U');
const bases='UCAG', amino='FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
export const CODE={};let n=0;for(const a of bases)for(const b of bases)for(const c of bases)CODE[a+b+c]=amino[n++];
export const NAMES={F:'Fenilalanina',L:'Leucina',S:'Serina',Y:'Tirosina','*':'Parada',C:'Cisteína',W:'Triptofano',P:'Prolina',H:'Histidina',Q:'Glutamina',R:'Arginina',I:'Isoleucina',M:'Metionina',T:'Treonina',N:'Asparagina',K:'Lisina',V:'Valina',A:'Alanina',D:'Aspartato',E:'Glutamato',G:'Glicina'};
export function translate(rna,frame=0){if(!/^[AUCG]+$/.test(rna)||![0,1,2].includes(frame))throw Error('RNA ou quadro inválido');let codons=[];for(let i=frame;i+2<rna.length;i+=3){let codon=rna.slice(i,i+3);codons.push({codon,aa:CODE[codon],position:i+1});if(CODE[codon]==='*')break}return {codons,protein:codons.filter(c=>c.aa!=='*').map(c=>c.aa).join(''),remainder:Math.max(0,rna.length-frame)%3}}
export function mutate(s,type,pos,bases='A',count=1){s=validate(s);if(!Number.isInteger(pos)||pos<1||pos>s.length+(type==='insert'?1:0))throw Error('Posição fora da sequência');if(type==='delete'){if(!Number.isInteger(count)||count<1||pos+count-1>s.length)throw Error('Quantidade inválida');return validate(s.slice(0,pos-1)+s.slice(pos-1+count))}bases=validate(bases);const out=s.slice(0,pos-1)+bases+s.slice(pos-1+(type==='replace'?1:0));if(!['insert','replace'].includes(type))throw Error('Operação inválida');return validate(out)}
export function compare(a,b,frame=0){a=validate(a);b=validate(b);const old=translate(transcribe(a),frame),next=translate(transcribe(b),frame),delta=b.length-a.length;let kind;if(a===b)kind='Sem alteração';else if(delta%3)kind='Alteração do quadro de leitura';else if(delta)kind='Inserção/deleção em múltiplo de três';else if(old.protein===next.protein&&old.codons.length===next.codons.length)kind='Sinônima no trecho traduzido';else if(next.codons.some((c,i)=>c.aa==='*'&&old.codons[i]?.aa!=='*'))kind='Nonsense (parada antecipada)';else kind='Missense ou alteração da parada';return {old,next,delta,kind,differences:Array.from({length:Math.max(a.length,b.length)},(_,i)=>i).filter(i=>a[i]!==b[i])}}
export const QUESTIONS=[
['Inicial','Qual base complementa A?',['T','C','G'],0,'A adenina pareia com a timina.'],
['Inicial','Qual é a fita complementar de ATGC, alinhada 3′ → 5′?',['TACG','GCAT','AUGC'],0,'Cada base é substituída por seu par, mantendo as posições alinhadas.'],
['Inicial','As duas fitas de DNA são…',['Antiparalelas','Paralelas','Ambas RNA'],0,'Uma fita segue 5′ → 3′ e a outra 3′ → 5′.'],
['Inicial','ATGC tem qual percentual de GC?',['25%','50%','75%'],1,'Duas das quatro bases são G ou C: 50%.'],
['Intermediário','A fita codificante 5′ ATGC 3′ produz qual RNA?',['AUGC','UACG','GCAT'],0,'O RNA tem a sequência da fita codificante, com U no lugar de T.'],
['Intermediário','No código padrão, AUG codifica…',['Metionina','Glicina','Parada'],0,'AUG codifica metionina; também pode atuar como início no contexto adequado.'],
['Intermediário','Qual é um códon de parada?',['UGA','UGG','GGA'],0,'UGA, UAA e UAG são sinais de parada no código padrão.'],
['Intermediário','GAA → GAG mantém glutamato. A troca é…',['Sinônima','Nonsense','Deleção'],0,'Os dois códons especificam o mesmo aminoácido.'],
['Avançado','Inserir uma base em uma região codificante tende a…',['Deslocar o quadro de leitura','Sempre causar doença','Manter todos os códons'],0,'Uma base não é múltiplo de três e muda o agrupamento a jusante.'],
['Avançado','Uma edição conceitual garante o resultado em células?',['Não','Sim','Só em humanos'],0,'Reparo, contexto e alterações não intencionais tornam resultados experimentais variáveis.'],
['Avançado','A fita molde informada 5′ CAT 3′ produz…',['AUG','CAU','GUA'],0,'O RNA é o complemento reverso da fita molde, com U no lugar de T.'],
['Avançado','Deletar três bases preserva o quadro a jusante?',['Sim, embora possa mudar aminoácidos','Não, nunca','Garante função normal'],0,'O comprimento muda em um múltiplo de três; a função não é determinada por isso.']
];
export const checkAnswer=(i,a)=>QUESTIONS[i]?.[3]===a;
export function loadProgress(storage){try{const p=JSON.parse(storage.getItem('biolab-progress'));return {done:[...new Set(p?.done||[])].filter(i=>Number.isInteger(i)&&i>=0&&i<QUESTIONS.length),best:Math.max(0,Math.min(120,Number(p?.best)||0))}}catch{return {done:[],best:0}}}
export function saveProgress(storage,p){try{storage.setItem('biolab-progress',JSON.stringify(p));return true}catch{return false}}
