// @ts-ignore
const presence = new Presence({
  clientId: '1363276484436820019'
});

//
const logosManuais: { [key: string]: string } = {
   // --- Grupo BBB---
   "Mosaico": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "BBB": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "Quarto Sonho de Eternidade": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "Quarto Sonho de Voar": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "Quarto Sonho do Grande Amor": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "Cozinha": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "Banheiro Super Cimed": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "Sala Sonho de Ser Milionário": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "Quarto Branco": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   "Academia Nivea": "http://channelart.8b90287dn2.online/images/logos/bbbrasil.png",
   // --- Grupo Hora do Jogo ---
  "HORA DO JOGO": "http://channelart.8b90287dn2.online/images/logos/horadojogonew.png",
   // --- Grupo GLOBO SUDESTE ---
"Globo SP FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo SP HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo SP":  "https://i.imgur.com/X4vvnpc.png",
"Globo SP Alternativo HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo SP Alternativo":  "https://i.imgur.com/X4vvnpc.png",
"Globo RJ FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo RJ HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo RJ":  "https://i.imgur.com/X4vvnpc.png",
"Globo RJ Alternativo HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo RJ Alternativo":  "https://i.imgur.com/X4vvnpc.png",
"Globo MG FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo MG HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo MG":  "https://i.imgur.com/X4vvnpc.png",
"Globo MG Alternativo HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo MG Alternativo":  "https://i.imgur.com/X4vvnpc.png",
"Globo Mogi das Cruzes FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Mogi das Cruzes HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Campinas FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Campinas HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Campinas":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Ribeirão Preto FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Ribeirão Preto HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Ribeirão Preto":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Sao Carlos HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Sao Carlos":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Sul de Minas FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Sul de Minas HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo EPTV Sul de Minas":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Vanguarda SJ Campos FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Vanguarda SJ Campos HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Vanguarda SJ Campos":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Vanguarda Taubate FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Vanguarda Taubate HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Vanguarda Taubate":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tribuna Santos FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tribuna Santos HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tribuna Santos":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Sorocaba FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Sorocaba HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Sorocaba":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem S. J. Rio Preto FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem S. J. do Rio Preto HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem S. J. do Rio Preto":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Bauru FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Bauru HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Bauru":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Itapetininga FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Itapetinga HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Tem Itapetininga":  "https://i.imgur.com/X4vvnpc.png",
"Globo Presidente Prudente FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Presidente Prudente HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Presidente Prudente":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Sergipe FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Sergipe HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Sergipe":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rio Sul FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rio Sul HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rio Sul":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Gazeta Vitoria FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Gazeta Vitoria HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Gazeta Vitoria":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Gazeta Sul ES FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Gazeta Sul ES HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Alto Litoral FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Alto Litoral HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Alto Litoral":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Serra Mar FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Serra Mar HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Serra Mar": "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV dos Vales FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV dos Vales HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV dos Vales":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Liberal Castanhal":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Grande Minas FHD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Grande Minas HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Grande Minas":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Integração Araxa HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Integração Araxa":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Integração Uberaba HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Integração Uberaba":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Integração Juiz de Fora HD":  "https://i.imgur.com/X4vvnpc.png",
"Globo TV Integração Juiz de Fora": "https://i.imgur.com/X4vvnpc.png",
   // --- Grupo GLOBO SUL ---
"Globo RBS Porto Alegre FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS Porto Alegre HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS Porto Alegre": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Curitiba FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Curitiba HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Curitiba": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Curitiba Alternativo HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Curitiba Alternativo": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Londrina FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Londrina HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Londrina": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Foz do Iguaçu FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Foz do Iguaçu HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Foz do Iguaçu": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Maringa FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Maringa HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Maringa": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Cascavel FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Cascavel HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Cascavel": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC TV Paranavai FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC TV Paranavai HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC TV Paranavai": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC TV Ponta Grossa FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC TV Ponta Grossa HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC TV Ponta Grossa": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Pelotas FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Pelotas HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Pelotas": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Caxias do Sul FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Caxias do Sul HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Caxias do Sul": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Passo Fundo FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Passo Fundo HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Passo Fundo": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Santa Maria FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Santa Maria HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Santa Maria": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Florianopolis FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Florianopolis HD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Florianopolis": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Joinville FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Joinville HD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Joinville": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Chapecó FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Chapecó HD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Chapecó": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Blumenau FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Blumenau HD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Blumenal": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Criciuma FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Criciuma HD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Criciuma": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Centro Oeste FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Centro Oeste HD": "https://i.imgur.com/X4vvnpc.png",
"Globo NSC TV Centro Oeste": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV POA FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV POA HD": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS Santa Maria": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS TV Uruguaiana": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS Erechim": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS dos Vales": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS Santa Rosa": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS Rio Grande": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS Cruz Alta": "https://i.imgur.com/X4vvnpc.png",
"Globo RBS Bage HD": "https://i.imgur.com/X4vvnpc.png",
 // --- Grupo GLOBO CENTRO OESTE---
 "Globo TV Anhanguera FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera": "https://i.imgur.com/X4vvnpc.png",
"Globo Brasília FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo Brasília HD": "https://i.imgur.com/X4vvnpc.png",
"Globo Brasília": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Morena Campo Grande FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Morena Campo Grande HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Morena Campo Grande": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Morena FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Morena HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Morena": "https://i.imgur.com/X4vvnpc.png",
"Globo TV C. America Cuiabá FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV C. America Cuiabá HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV C. America Cuiaba": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Rio Verde HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Rio Verde": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Jatai HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Jatai": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Itumbiara HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Itumbiara": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Luziania HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Luziania": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Anhanguera Catalão": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Morena Corumba": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Morena Ponta Pora": "https://i.imgur.com/X4vvnpc.png",
"Globo Rede Amazonica Cruzeiro do Sul": "https://i.imgur.com/X4vvnpc.png",
"Globo Rede Amazonica Guajara Mirim": "https://i.imgur.com/X4vvnpc.png",
"Globo Rede Amazonica Itacoatiara": "https://i.imgur.com/X4vvnpc.png",
"Globo Rede Amazonica Ji-Parana": "https://i.imgur.com/X4vvnpc.png",
"Globo Rede Amazonica Macapa": "https://i.imgur.com/X4vvnpc.png",
"Globo Rede Amazonica Parinstins": "https://i.imgur.com/X4vvnpc.png",
"Globo Rede Amazonica Vilhena": "https://i.imgur.com/X4vvnpc.png",
"Globo Palmas TO": "https://i.imgur.com/X4vvnpc.png",
"Globo RPC Guarapuava": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Liberal Redencao": "https://i.imgur.com/X4vvnpc.png",
// --- Grupo GLOBO NORDESTE---
"Globo Nordeste FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo Nordeste HD": "https://i.imgur.com/X4vvnpc.png",
"Globo Nordeste": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Verdes Mares Fortaleza FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Verdes Mares Fortaleza HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Verdes Mares Fortaleza": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Bahia FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Bahia HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Bahia": "https://i.imgur.com/X4vvnpc.png",
"Globo Recife FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo Recife HD": "https://i.imgur.com/X4vvnpc.png",
"Globo Recife": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Santa Cruz FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Santa Cruz HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Santa Cruz": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Asa Branca FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Asa Branca HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Asa Branca": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Mirante São Luis FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Mirante São Luis HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Mirante São Luis": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Mirante Cocais FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Mirante Cocais HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Mirante Cocais": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Gazeta Alagoas FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Gazeta Alagoas HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Gazeta Alagoas": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Verdes Mares Cariri FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Verdes Mares Cariri HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Verde Mares Cariri": "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Cabugi FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Cabugi HD": "https://i.imgur.com/X4vvnpc.png",
"Globo Inter TV Cabugi": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Clube Teresina FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Clube Teresina HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Clube Teresina": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Cabo Branco FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Cabo Branco HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Cabo Branco": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Subae FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Subae HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Subae": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Sudoeste FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Sudoeste HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Sudoeste": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Mirante Balsas": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Mirante Imperatriz": "https://i.imgur.com/X4vvnpc.png",
// --- Grupo GLOBO NORTE ---
"Globo TV Liberal Belem FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Liberal Belem HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Liberal Belem": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Manaus FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Manaus HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Manaus": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Boa Vista FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Boa Vista HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Boa Vista": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Porto Velho FHD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Porto Velho HD": "https://i.imgur.com/X4vvnpc.png",
"Globo TV Rede Amazonica Porto Velho": "https://i.imgur.com/X4vvnpc.png",
// --- Grupo RECORD ---
"Record": "http://channelart.8b90287dn2.online/images/logos/Record.png",
// --- Grupo BAND---
"Band SP": "https://i.imgur.com/Kr2qde0.png",
// --- Grupo SBT ---
"SBT": "http://channelart.8b90287dn2.online/images/logos/SBT.png",
// --- Grupo ABERTOS ---
"Rede TV FHD": "https://i.imgur.com/OTOwv7D.png",
"Rede TV HD": "https://i.imgur.com/OTOwv7D.png",
"Rede TV": "https://i.imgur.com/OTOwv7D.png",
"TV Diário Fortaleza FHD": "https://i.imgur.com/UanGpvt.png",
"TV Diario Fortaleza HD": "https://i.imgur.com/UanGpvt.png",
"TV Diário Fortaleza": "https://i.imgur.com/UanGpvt.png",
"Tv Cultura FHD": "https://i.imgur.com/1jPmjNX.png",
"TV Cultura HD": "https://i.imgur.com/1jPmjNX.png",
"TV Cultura": "https://i.imgur.com/1jPmjNX.png",
"TV Brasil FHD": "https://i.imgur.com/187qcZL.png",
"TV Brasil HD": "https://i.imgur.com/187qcZL.png",
"TV Brasil": "https://i.imgur.com/187qcZL.png",
"TV Câmara HD": "https://i.imgur.com/Ed5S5kN.png",
"TV Justiça HD": "https://i.imgur.com/hZiywQ3.png",
"TV Justica": "https://i.imgur.com/hZiywQ3.png",
"TV Senado HD": "https://i.imgur.com/0USs31g.png",
"TV Senado": "https://i.imgur.com/0USs31g.png",
"TV Gazeta SP FHD": "https://i.imgur.com/dFJ38JZ.png",
"TV Gazeta SP HD": "https://i.imgur.com/dFJ38JZ.png",
"TV Gazeta SP": "https://i.imgur.com/dFJ38JZ.png",
"Futura FHD": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Canal_Futura.png",
"Futura HD": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Canal_Futura.png",
"Futura": "https://upload.wikimedia.org/wikipedia/commons/8/8e/Canal_Futura.png",
"Canal do Boi HD": "https://i.imgur.com/ZbV1M0p.png",
"Canal do Boi": "https://i.imgur.com/ZbV1M0p.png",
"Canal Rural": "https://i.imgur.com/8lujK15.png",
"TV Cultura PA": "http://channelart.8b90287dn2.online/images/logos/Cultura.png",
// --- Grupo NOTÍCIAS ---
"Globo News FHD": "https://i.imgur.com/GMTdEOO.png",
"Globo News HD": "https://i.imgur.com/GMTdEOO.png",
"Globo News": "https://i.imgur.com/GMTdEOO.png",
"Band News FHD": "https://i.imgur.com/yQ8JMih.png",
"Band News HD": "https://i.imgur.com/yQ8JMih.png",
"Band News": "https://i.imgur.com/yQ8JMih.png",
"CNN Brasil FHD": "https://i.imgur.com/qpuJc7w.png",
"CNN Brasil HD": "https://i.imgur.com/qpuJc7w.png",
"CNN Brasil": "https://i.imgur.com/qpuJc7w.png",
"CNN Money": "https://i.imgur.com/PJDHUb6.png",
"CNN Internacional": "https://i.imgur.com/PJDHUb6.png",
"Jovem Pan News FHD": "https://s.jpimg.com.br/wp-content/themes/jovempan/assets/build/images/logo-jovempan-white.png?v2",
"Jovem Pan News HD": "https://s.jpimg.com.br/wp-content/themes/jovempan/assets/build/images/logo-jovempan-white.png?v2",
"Jovem Pan News": "https://s.jpimg.com.br/wp-content/themes/jovempan/assets/build/images/logo-jovempan-white.png?v2",
"Canal UOL FHD": "https://logodownload.org/wp-content/uploads/2018/09/uol-logo-0.png",
"Canal UOL HD": "https://logodownload.org/wp-content/uploads/2018/09/uol-logo-0.png",
"SBT News FHD": "https://i.imgur.com/cgrvMkA.png",
"SBT News HD": "https://i.imgur.com/cgrvMkA.png",
"SBT News": "https://i.imgur.com/cgrvMkA.png",
"Record News FHD": "https://i.imgur.com/pXLPrP5.png",
"Record News HD": "https://i.imgur.com/pXLPrP5.png",
"Record News": "https://i.imgur.com/pXLPrP5.png",
"CNBC Times Brasil": "https://i.imgur.com/fQneR43.png",
"BBC World News": "https://i.imgur.com/9km8P3Q.png",
"FOX News (CA)": "https://i.imgur.com/EWhnFvZ.png",
"RAI News 24hs": "https://i.imgur.com/pV31pWJ.png",
"Bloomberg News": "https://i.imgur.com/XGt5ekO.png",
// --- Grupo ESPORTES ---
"SporTV FHD": "https://i.imgur.com/u2TPadN.png",
"SporTV HD": "https://i.imgur.com/u2TPadN.png",
"SporTV": "https://i.imgur.com/u2TPadN.png",
"SporTV 4k": "https://i.imgur.com/u2TPadN.png",
"SporTV Alternativo HD": "https://i.imgur.com/u2TPadN.png",
"SporTV 2 FHD": "https://i.imgur.com/4EE6STs.png",
"SporTV 2 HD": "https://i.imgur.com/4EE6STs.png",
"SporTV 2": "https://i.imgur.com/4EE6STs.png",
"SporTV 2 Alternativo HD": "https://i.imgur.com/4EE6STs.png",
"SporTV 3 FHD": "https://i.imgur.com/eIBnc0F.png",
"SporTV 3 HD": "https://i.imgur.com/eIBnc0F.png",
"SporTV 3": "https://i.imgur.com/eIBnc0F.png",
"SporTV 3 Alternativo HD": "https://i.imgur.com/eIBnc0F.png",
"SporTV 4 FHD": "https://i.imgur.com/u2TPadN.png",
"GE TV HD": "http://channelart.8b90287dn2.online/images/logos/ge-logo.png",
"GE TV FHD": "http://channelart.8b90287dn2.online/images/logos/ge-logo.png",
"Redbull TV": "https://i.imgur.com/836ve6x.png",
"Band Sports FHD": "https://i.imgur.com/EanrLvJ.png",
"Band Sports HD": "https://i.imgur.com/EanrLvJ.png",
"Band Sports": "https://i.imgur.com/EanrLvJ.png",
"Band Sports FHD²": "https://i.imgur.com/EanrLvJ.png",
"Band Sports Alternativo HD": "https://i.imgur.com/EanrLvJ.png",
"Combate FHD": "https://i.imgur.com/scH04xC.png",
"Combate HD": "https://i.imgur.com/scH04xC.png",
"Combate": "https://i.imgur.com/scH04xC.png",
"Combate FHD²": "https://i.imgur.com/scH04xC.png",
"Combate Alternativo HD": "https://i.imgur.com/scH04xC.png",
"Xsports FHD": "https://i.imgur.com/QstCyUG.png",
"Xsports HD": "https://i.imgur.com/QstCyUG.png",
// --- Grupo PREMIERE ---
"Premiere Clubes FHD": "https://i.imgur.com/7aaOk3n.png",
"Premiere Clubes HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere Clubes": "https://i.imgur.com/7aaOk3n.png",
"Premiere Clubes 4k": "https://i.imgur.com/7aaOk3n.png",
"Premiere Clubes Alternativo": "https://i.imgur.com/7aaOk3n.png",
"Premiere 2 FHD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 2 HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 2": "https://i.imgur.com/7aaOk3n.png",
"Premiere 2 Alternativo HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 2 Alternativo": "https://i.imgur.com/7aaOk3n.png",
"Premiere 3 FHD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 3 HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 3": "https://i.imgur.com/7aaOk3n.png",
"Premiere 3 Alternativo HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 3 Alternativo": "https://i.imgur.com/7aaOk3n.png",
"Premiere 4 FHD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 4 HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 4": "https://i.imgur.com/7aaOk3n.png",
"Premiere 4 Alternativo HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 4 Alternativo": "https://i.imgur.com/7aaOk3n.png",
"Premiere 5 FHD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 5 HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 5": "https://i.imgur.com/7aaOk3n.png",
"Premiere 5 Alternativo HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 5 Alternativo": "https://i.imgur.com/7aaOk3n.png",
"Premiere 6 FHD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 6 HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 6": "https://i.imgur.com/7aaOk3n.png",
"Premiere 6 Alternativo HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 6 Alternativo": "https://i.imgur.com/7aaOk3n.png",
"Premiere 7 FHD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 7 HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 7": "https://i.imgur.com/7aaOk3n.png",
"Premiere 7 Alternativo HD": "https://i.imgur.com/7aaOk3n.png",
"Premiere 7 Alternativo": "https://i.imgur.com/7aaOk3n.png",
"Premiere 8": "https://i.imgur.com/7aaOk3n.png",
// --- Grupo ESPN ---
"ESPN FHD": "https://i.imgur.com/eqaXTje.png",
"ESPN HD": "https://i.imgur.com/eqaXTje.png",
"ESPN": "https://i.imgur.com/eqaXTje.png",
"ESPN 4k": "https://i.imgur.com/eqaXTje.png",
"ESPN Alternativo HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 4 FHD²": "https://i.imgur.com/eqaXTje.png",
"ESPN 4 HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 4": "https://i.imgur.com/eqaXTje.png",
"ESPN 4 FHD": "https://i.imgur.com/eqaXTje.png",
"ESPN 4 Alternativo HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 2 FHD": "https://i.imgur.com/eqaXTje.png",
"ESPN 2 HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 2": "https://i.imgur.com/eqaXTje.png",
"ESPN 2 FHD²": "https://i.imgur.com/eqaXTje.png",
"ESPN 2 Alternativo HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 3 Alternativo": "https://i.imgur.com/eqaXTje.png",
"ESPN 3 FHD": "https://i.imgur.com/eqaXTje.png",
"ESPN 3 HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 3": "https://i.imgur.com/eqaXTje.png",
"ESPN 3 FHD²": "https://i.imgur.com/eqaXTje.png",
"ESPN 3 Alternativo HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 5 FHD": "https://i.imgur.com/eqaXTje.png",
"ESPN 5 HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 5": "https://i.imgur.com/eqaXTje.png",
"ESPN 5 FHD²": "https://i.imgur.com/eqaXTje.png",
"ESPN 5 Alternativo HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 6 FHD": "https://i.imgur.com/eqaXTje.png",
"ESPN 6 HD": "https://i.imgur.com/eqaXTje.png",
"ESPN 6": "https://i.imgur.com/eqaXTje.png",
"ESPN 6 FHD²": "https://i.imgur.com/eqaXTje.png",
"ESPN 6 Alternativo HD": "https://i.imgur.com/eqaXTje.png",
// --- Grupo PARAMOUNT+ ---
"Paramount+ 1 FHD": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 1 HD": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 1": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 2 FHD": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 2 HD": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 2": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 3 FHD": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 3 HD": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 3": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 4 FHD": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 4 HD": "https://i.imgur.com/LQ9EESV.png",
"Paramount+ 4": "https://i.imgur.com/LQ9EESV.png",
// --- Grupo ESPORTES PPV ---
"MR. Olympia": "https://i.imgur.com/29Ht6fR.png",
"CazeTV 01": "https://i.imgur.com/Ph45TIG.png",
"CazeTV 02": "https://i.imgur.com/Ph45TIG.png",
"CazeTV 03": "https://i.imgur.com/Ph45TIG.png",
"DAZN 1 HD": "http://channelart.8b90287dn2.online/images/logos/DAZN.png",
"DAZN 2 HD": "http://channelart.8b90287dn2.online/images/logos/DAZN.png",
"DAZN 3 HD": "http://channelart.8b90287dn2.online/images/logos/DAZN.png",
"Flamengo TV": "https://pbs.twimg.com/media/CW7Yh9XWAAAOTV2.png",
"Furacão TV FHD": "",
"Furacão TV HD": "",
"Furacão Live": "",
"TV Coxa HD": "",
"Nsports 1": "https://i.postimg.cc/qRHJMVhB/Photoroom-20250115-210723.png",
"Nsports 2": "https://i.postimg.cc/qRHJMVhB/Photoroom-20250115-210723.png",
"Nsports 3": "https://i.postimg.cc/qRHJMVhB/Photoroom-20250115-210723.png",
"OneFootball FHD": "https://i.imgur.com/Vffup28.png",
"OneFootball HD": "https://i.imgur.com/Vffup28.png",
"OneFootball": "https://i.imgur.com/Vffup28.png",
"BJJ Stars HD": "https://gamov.com.br/wp-content/uploads/2015/12/bjj-stars-gamov-300x184.png",
"Sporty Net 1 FHD": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 1 HD": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 1": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 2 FHD": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 2": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 2 HD": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 3 FHD": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 3 HD": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 3": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 4 FHD": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 4 HD": "https://i.imgur.com/blz0G9m.png",
"Sporty Net 4": "https://i.imgur.com/blz0G9m.png",
"Apple TV+ 1": "https://i.imgur.com/jMCSQ5x.png",
"Apple TV+ 2": "https://i.imgur.com/jMCSQ5x.png",
"Apple TV+ 3": "https://i.imgur.com/jMCSQ5x.png",
"Canal GOAT 01": "https://canalgoat.com.br/wp-content/uploads/2024/10/Canal-Goat-Escudo-Color.png",
"Canal GOAT 02": "https://canalgoat.com.br/wp-content/uploads/2024/10/Canal-Goat-Escudo-Color.png",
"Canal GOAT 03": "https://canalgoat.com.br/wp-content/uploads/2024/10/Canal-Goat-Escudo-Color.png",
"Zapping Sports": "https://i.imgur.com/NIr5GI4.png",
"Flograppling": "https://i.imgur.com/Nk2KA1l.png",
"UOL Play": "https://logodownload.org/wp-content/uploads/2018/09/uol-logo-0.png",
"FIFA+ 1": "https://i.postimg.cc/j2L56kdP/images-(1)-(1).png",
"FIFA+ 2": "https://i.postimg.cc/j2L56kdP/images-(1)-(1).png",
"FIFA+ 3": "https://i.postimg.cc/j2L56kdP/images-(1)-(1).png",
"FlaTV+": "https://i.imgur.com/ImY4NKr.png",
"Evento PPV": "",
// --- Grupo DISNEY+ ---
"Disney+ 1": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 1 Alternativo": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 2": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 2 Alternativo": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 3": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 4": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 5": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 6": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 7": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 8": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 9": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 10": "https://i.imgur.com/wPRIU2g.png",
"Disney+ 11": "https://i.imgur.com/wPRIU2g.png",
// --- Grupo PRIME VIDEO ---
"Prime Video FHD 1": "https://i.imgur.com/CO1u8jF.png",
"Prime Video HD 1": "https://i.imgur.com/CO1u8jF.png",
"Prime Video 1": "https://i.imgur.com/CO1u8jF.png",
"Prime Video FHD 2": "https://i.imgur.com/CO1u8jF.png",
"Prime Video HD 2": "https://i.imgur.com/CO1u8jF.png",
"Prime Video 2": "https://i.imgur.com/CO1u8jF.png",
"Prime Video 03": "https://i.imgur.com/CO1u8jF.png",
"Prime Video 04": "https://i.imgur.com/CO1u8jF.png",
// --- Grupo MAX ---
"Max 1": "https://i.imgur.com/o7TopvX.png",
"Max 1 Alternativo": "https://i.imgur.com/o7TopvX.png",
"Max 2": "https://i.imgur.com/o7TopvX.png",
"Max 2 Alternativo": "https://i.imgur.com/o7TopvX.png",
"Max 3": "https://i.imgur.com/o7TopvX.png",
"Max 4": "https://i.imgur.com/o7TopvX.png",
"Max 5": "https://i.imgur.com/o7TopvX.png",
"Max 6": "https://i.imgur.com/o7TopvX.png",
"Max 7": "https://i.imgur.com/o7TopvX.png",
"Max 8": "https://i.imgur.com/o7TopvX.png",
"Max 9": "https://i.imgur.com/o7TopvX.png",
"Max 10": "https://i.imgur.com/o7TopvX.png",
"Mosaico Champions": "https://i.imgur.com/o7TopvX.png",
// --- Grupo TELECINE ---
"Telecine Premium FHD": "https://i.imgur.com/Q23rNKX.png",
"Telecine Premium HD": "https://i.imgur.com/Q23rNKX.png",
"Telecine Premium": "https://i.imgur.com/Q23rNKX.png",
"Telecine Pipoca FHD": "https://i.imgur.com/XUnXPUw.png",
"Telecine Pipoca HD": "https://i.imgur.com/XUnXPUw.png",
"Telecine Pipoca": "https://i.imgur.com/XUnXPUw.png",
"Telecine Action FHD": "https://i.imgur.com/MtuAvjj.png",
"Telecine Action HD": "https://i.imgur.com/MtuAvjj.png",
"Telecine Action": "https://i.imgur.com/MtuAvjj.png",
"Telecine Touch FHD": "https://i.imgur.com/3FcpQZ7.png",
"Telecine Touch HD": "https://i.imgur.com/3FcpQZ7.png",
"Telecine Touch": "https://i.imgur.com/3FcpQZ7.png",
"Telecine Fun FHD": "https://i.imgur.com/J86GUtP.png",
"Telecine Fun HD": "https://i.imgur.com/J86GUtP.png",
"Telecine Fun": "https://i.imgur.com/J86GUtP.png",
"Telecine Cult FHD": "https://i.imgur.com/ZFctYJ8.png",
"Telecine Cult HD": "https://i.imgur.com/ZFctYJ8.png",
"Telecine Cult": "https://i.imgur.com/ZFctYJ8.png",
"Megapix FHD": "https://i.imgur.com/MI2Ibuh.png",
"Megapix HD": "https://i.imgur.com/MI2Ibuh.png",
"Megapix": "https://i.imgur.com/MI2Ibuh.png",
"USA FHD": "https://i.imgur.com/1lKqVZx.png",
"USA HD": "https://i.imgur.com/1lKqVZx.png",
"USA": "https://i.imgur.com/1lKqVZx.png",
"Universal TV FHD": "https://i.imgur.com/1zG6ZFQ.png",
"Universal TV HD": "https://i.imgur.com/1zG6ZFQ.png",
"Universal TV": "https://i.imgur.com/1zG6ZFQ.png",
"Canal Brasil FHD": "https://i.imgur.com/CoNSBma.png",
"Canal Brasil HD": "https://i.imgur.com/CoNSBma.png",
"Canal Brasil": "https://i.imgur.com/CoNSBma.png",
// --- Grupo HBO ---
"HBO": "https://i.imgur.com/C6vqPYM.png",
// --- Grupo FILMES E SÉRIES ---
"AMC FHD": "https://i.imgur.com/s4jMCYd.png",
"AMC HD": "https://i.imgur.com/s4jMCYd.png",
"AMC": "https://i.imgur.com/s4jMCYd.png",
"AXN FHD": "https://i.imgur.com/UjUUMuf.png",
"AXN HD": "https://i.imgur.com/UjUUMuf.png",
"AXN": "https://i.imgur.com/UjUUMuf.png",
"TNT FHD": "https://i.imgur.com/OBqQ5a9.png",
"TNT HD": "https://i.imgur.com/OBqQ5a9.png",
"TNT": "https://i.imgur.com/OBqQ5a9.png",
"TNT Alternativo HD": "https://i.imgur.com/OBqQ5a9.png",
"TNT Alternativo": "https://i.imgur.com/OBqQ5a9.png",
"Cinemax FHD": "https://i.imgur.com/BiZkQnH.png",
"Cinemax HD": "https://i.imgur.com/BiZkQnH.png",
"Cinemax": "https://i.imgur.com/BiZkQnH.png",
"Sony Channel FHD": "https://i.imgur.com/U5HYoC4.png",
"Sony Channel HD": "https://i.imgur.com/U5HYoC4.png",
"Sony Channel": "https://i.imgur.com/U5HYoC4.png",
"Sony Movies FHD": "https://i.imgur.com/eLTUHKN.png",
"Sony Movies HD": "https://i.imgur.com/eLTUHKN.png",
"Sony Movies": "https://i.imgur.com/eLTUHKN.png",
"Space FHD": "https://i.imgur.com/xBj59jK.png",
"Space HD": "https://i.imgur.com/xBj59jK.png",
"Space": "https://i.imgur.com/xBj59jK.png",
"Studio Universal": "https://i.imgur.com/VmpbSgJ.png",
"Studio Universal FHD": "https://i.imgur.com/VmpbSgJ.png",
"Studio Universal HD": "https://i.imgur.com/VmpbSgJ.png",
"TCM FHD": "https://i.imgur.com/hiTw1zj.png",
"TCM": "https://i.imgur.com/hiTw1zj.png",
"TNT Novelas FHD": "https://i.imgur.com/OBqQ5a9.png",
"TNT Novelas HD": "https://i.imgur.com/OBqQ5a9.png",
"TNT Novelas": "https://i.imgur.com/OBqQ5a9.png",
"TNT Series FHD": "https://i.imgur.com/OBqQ5a9.png",
"TNT Series HD": "https://i.imgur.com/OBqQ5a9.png",
"TNT Series": "https://i.imgur.com/OBqQ5a9.png",
"Warner Channel FHD": "https://i.imgur.com/A28CzhF.png",
"Warner Channel HD": "https://i.imgur.com/A28CzhF.png",
"Warner Channel": "https://i.imgur.com/A28CzhF.png",
"Film & Arts": "https://i.imgur.com/Sfs6Cbb.png",
// --- Grupo LEGENDADOS ---
"AXN FHD LEG": "https://i.imgur.com/UjUUMuf.png",
"TNT LEG": "https://i.imgur.com/OBqQ5a9.png",
"HBO FHD LEG": "https://i.imgur.com/C6vqPYM.png",
"HBO LEG": "https://i.imgur.com/C6vqPYM.png",
"HBO Mundi HD LEG": "https://i.imgur.com/C6vqPYM.png",
"HBO Mundi LEG": "https://i.imgur.com/C6vqPYM.png",
"HBO Plus LEG": "https://i.imgur.com/C6vqPYM.png",
"HBO POP LEG": "https://i.imgur.com/C6vqPYM.png",
"HBO Signature LEG": "https://i.imgur.com/C6vqPYM.png",
"HBO Xtreme LEG": "https://i.imgur.com/C6vqPYM.png",
"Megapix LEG": "https://i.imgur.com/MI2Ibuh.png",
"Sony Channel LEG": "https://i.imgur.com/U5HYoC4.png",
"Space LEG": "https://i.imgur.com/xBj59jK.png",
"Telecine Action LEG": "https://i.imgur.com/MtuAvjj.png",
"Telecine Fun LEG": "https://i.imgur.com/J86GUtP.png",
"Telecine Pipoca LEG": "https://i.imgur.com/XUnXPUw.png",
"Telecine Premium LEG": "https://i.imgur.com/Q23rNKX.png",
"Telecine Touch LEG": "https://i.imgur.com/3FcpQZ7.png",
"TNT Series LEG": "https://i.imgur.com/OBqQ5a9.png",
"Warner HD LEG": "https://i.imgur.com/A28CzhF.png",
// --- Grupo DOCUMENTÁRIOS ---
"Animal Planet FHD": "https://i.imgur.com/qlpHlBw.png",
"Animal Planet HD": "https://i.imgur.com/qlpHlBw.png",
"Animal Planet": "https://i.imgur.com/qlpHlBw.png",
"Animal Planet Alternativo HD": "https://i.imgur.com/qlpHlBw.png",
"HGTV FHD": "https://i.imgur.com/jzxJYrE.png",
"HGTV HD": "https://i.imgur.com/jzxJYrE.png",
"HGTV": "https://i.imgur.com/jzxJYrE.png",
"HGTV Alternativo HD": "https://i.imgur.com/jzxJYrE.png",
"HGTV Alternativo": "https://i.imgur.com/jzxJYrE.png",
"History FHD": "https://i.imgur.com/g0dvaDI.png",
"History HD": "https://i.imgur.com/g0dvaDI.png",
"History": "https://i.imgur.com/g0dvaDI.png",
"History Alternativo HD": "https://i.imgur.com/g0dvaDI.png",
"History Alternativo": "https://i.imgur.com/g0dvaDI.png",
"H2 FHD": "https://i.imgur.com/aT2tFXa.png",
"H2 HD": "https://i.imgur.com/aT2tFXa.png",
"H2": "https://i.imgur.com/aT2tFXa.png",
"H2 Alternativo HD": "https://i.imgur.com/aT2tFXa.png",
"H2 Alternativo": "https://i.imgur.com/aT2tFXa.png",
// --- Grupo DISCOVERY ---
"Discovery Channel FHD": "https://i.imgur.com/hVBkwQH.png",
"Discovery Channel HD": "https://i.imgur.com/hVBkwQH.png",
"Discovery Channel": "https://i.imgur.com/hVBkwQH.png",
"Discovery Channel Alternativo HD": "https://i.imgur.com/hVBkwQH.png",
"Discovery Channel Alternativo": "https://i.imgur.com/hVBkwQH.png",
"Discovery Turbo FHD": "https://i.imgur.com/xBBTC04.png",
"Discovery Turbo HD": "https://i.imgur.com/xBBTC04.png",
"Discovery Turbo": "https://i.imgur.com/xBBTC04.png",
"Discovery Turbo Alternativo HD": "https://i.imgur.com/xBBTC04.png",
"Discovery Turbo Alternativo": "https://i.imgur.com/xBBTC04.png",
"Discovery Home&Health FHD": "https://i.imgur.com/5Gxe9Lb.png",
"Discovery Home&Health HD": "https://i.imgur.com/5Gxe9Lb.png",
"Discovery Home&Health": "https://i.imgur.com/5Gxe9Lb.png",
"Discovery Home & Health Alternativo": "https://i.imgur.com/5Gxe9Lb.png",
"Investigation Discovery FHD": "https://i.imgur.com/RfLhm06.png",
"Investigation Discovery HD": "https://i.imgur.com/RfLhm06.png",
"Investigation Discovery": "https://i.imgur.com/RfLhm06.png",
"Investigation Discovery Alternativo HD": "https://i.imgur.com/RfLhm06.png",
"Discovery World FHD": "https://i.imgur.com/heB8HZ7.png",
"Discovery World HD": "https://i.imgur.com/heB8HZ7.png",
"Discovery World": "https://i.imgur.com/heB8HZ7.png",
"Discovery Theater FHD": "https://i.imgur.com/d33J3zt.png",
"Discovery Theater HD": "https://i.imgur.com/d33J3zt.png",
"Discovery Theater": "https://i.imgur.com/d33J3zt.png",
"Discovery Theater Alternativo HD": "https://i.imgur.com/d33J3zt.png",
"Discovery Science FHD": "https://i.imgur.com/UWBkBR5.png",
"Discovery Science": "https://i.imgur.com/UWBkBR5.png",
"Discovery Science Alternativo HD": "https://i.imgur.com/UWBkBR5.png",
// --- Grupo VARIEDADES ---
"Multishow FHD": "https://i.imgur.com/OZPTwoN.png",
"Multishow HD": "https://i.imgur.com/OZPTwoN.png",
"Multishow": "https://i.imgur.com/OZPTwoN.png",
"Globoplay Novelas FHD": "https://i.imgur.com/jADDEtD.png",
"Globoplay Novelas HD": "https://i.imgur.com/jADDEtD.png",
"Globoplay Novelas": "https://i.imgur.com/jADDEtD.png",
"GNT FHD": "https://i.imgur.com/YZVVcxO.png",
"GNT HD": "https://i.imgur.com/YZVVcxO.png",
"GNT": "https://i.imgur.com/YZVVcxO.png",
"OFF FHD": "https://i.imgur.com/n2nkbwE.png",
"OFF HD": "https://i.imgur.com/n2nkbwE.png",
"OFF": "https://i.imgur.com/n2nkbwE.png",
"Bis FHD": "https://i.imgur.com/n9DHEoS.png",
"Bis HD": "https://i.imgur.com/n9DHEoS.png",
"Bis": "https://i.imgur.com/n9DHEoS.png",
"Lifetime FHD": "https://i.imgur.com/feqLrw7.png",
"Lifetime HD": "https://i.imgur.com/feqLrw7.png",
"Lifetime": "https://i.imgur.com/feqLrw7.png",
"TLC FHD": "https://i.imgur.com/2tuOE0f.png",
"TLC HD": "https://i.imgur.com/2tuOE0f.png",
"TLC": "https://i.imgur.com/2tuOE0f.png",
"A&E FHD": "https://i.imgur.com/fdOiUa4.png",
"A&E HD": "https://i.imgur.com/fdOiUa4.png",
"A&E": "https://i.imgur.com/fdOiUa4.png",
"Music Box Brasil FHD": "https://i.imgur.com/zG8DAi6.png",
"Music Box Brasil HD": "https://i.imgur.com/zG8DAi6.png",
"Music Box Brasil": "https://i.imgur.com/zG8DAi6.png",
"Prime Box Brasil FHD": "https://i.imgur.com/vFZh9jA.png",
"Prime Box Brasil HD": "https://i.imgur.com/vFZh9jA.png",
"Prime Box Brasil": "https://i.imgur.com/vFZh9jA.png",
"Curta! FHD": "https://i.imgur.com/DPYuZKI.png",
"Curta! HD": "https://i.imgur.com/DPYuZKI.png",
"Curta!": "https://i.imgur.com/DPYuZKI.png",
"Arte 1 FHD": "https://i.imgur.com/rYaHKYD.png",
"Arte 1 HD": "https://i.imgur.com/rYaHKYD.png",
"Arte 1": "https://i.imgur.com/rYaHKYD.png",
"Food Network FHD": "",
"Food Network HD": "",
"Food Network": "",
"E! FHD": "",
"E! HD": "",
"E!": "",
"Fish TV FHD": "",
"Fish TV HD": "",
"Fish TV": "",
"Woohoo FHD": "",
"Woohoo HD": "",
"Woohoo": "",
"Modo Viagem FHD": "",
"Modo Viagem HD": "",
"Modo Viagem": "",
"Travel Box Brazil FHD": "",
"Travel Box Brazil HD": "",
"Travel Box Brazil": "",
"Sabor & Arte": "",
"DOGTV": "",
"Urban TV": "",
"Polishop TV": "",
"NHK": "",
// --- Grupo INFANTIL ---
// --- Grupo RELIGIOSO ---
// --- Grupo CINE SKY ---
// --- Grupo DESENHO 24H ---
// --- Grupo ESPECIAIS 24H ---
// --- Grupo MARATONA 24H ---
// --- Grupo FILMES 24H ---
// --- Grupo SHOW 24H ---
// --- Grupo PORTUGAL---
// --- Grupo DESPORTO ---
// --- Grupo ESTADOS UNIDOS ---
// --- Grupo NBA LEAGUE PASS ---
// --- Grupo NFL GAME PASS ---
// --- Grupo MLB GAME PASS ---
// --- Grupo NHL CENTER ICE ---
// --- Grupo MLSSEASON PASS ---
// --- Grupo ESPECIAIS 24H ---
// --- Grupo ESPECIAIS 24H ---
// --- Grupo ESPECIAIS 24H ---
// --- Grupo ESPECIAIS 24H ---
// --- Grupo ESPECIAIS 24H ---
};


//
const logoPadrao = "logo.png";
const browsingTimestamp = Math.floor(Date.now() / 1000);
let ultimoTituloFilme = "";
let ultimaLogoFilme = ""; 
let lastHref = "";
let ultimoCanal = "";
let ultimoManual = "";
let bloquearManual = false;

//
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  const container = target?.closest('.streamselector.posterDiv');
  const img = container?.querySelector('img.mainsss') as HTMLImageElement | null;
  if (img) {
    ultimoTituloFilme = img.alt.trim();
    ultimaLogoFilme = img.src;
  }
});

const startBaseTimestamp = Math.floor(Date.now() / 1000);

presence.on('UpdateData', async () => {
  const href = window.location.href ?? "";
  if (lastHref !== href) lastHref = href;

  const isDashboard = href.includes('dashboard.php');
  const isLive = href.includes('live.php');
  const isMovie = href.includes('movies.php');
  const isSeries = href.includes('series.php');

  const privateMode = Boolean(await presence.getSetting("privateMode"));

  let detailsText = "";
  let stateText = "";
  let logoFinal = logoPadrao;

  // DASHBOARD
  if (isDashboard) {
    if (privateMode) {
      detailsText = "Navegando";
    } else {
      detailsText = "No Menu Principal";
      stateText = "Selecionando serviço...";
    }
  }

  // LIVE
  else if (isLive) {
    if (privateMode) {
      detailsText = "Canal Privado";
      logoFinal = logoPadrao;
    } else {
      const canalAtivo =
        document.querySelector('.liveFrameBody.active .liveFrameChanName span') as HTMLElement | null
        || document.querySelector('.list-group-item.active .channel-name') as HTMLElement | null
        || document.querySelector('.liveFrameChanName span') as HTMLElement | null;

      const nomeCanal = canalAtivo?.textContent?.trim() ?? "Escolhendo Canal...";
      detailsText = nomeCanal;

      const customEpg = String(await presence.getSetting("customEpg") || "").trim();

      // Detecta troca de canal
      if (
        nomeCanal &&
        nomeCanal !== "Escolhendo Canal..." &&
        nomeCanal !== ultimoCanal
      ) {
        ultimoCanal = nomeCanal;
        bloquearManual = true;
      }

      // Libera manual se usuário alterar
      if (customEpg !== ultimoManual) {
        bloquearManual = false;
      }
      ultimoManual = customEpg;

      const epgAtual = document.querySelector('.liveEPGdiv .liveEpgTime[data-titleis]') as HTMLElement | null;
      const programaNome = epgAtual?.getAttribute('data-titleis')?.trim() || "";

      const epgInvalido = [
        "Guia de programação indisponível",
        "Sem guia",
        "Sem programação",
        "N/A",
        nomeCanal
      ];

      //
      if (!bloquearManual && customEpg.length > 0) {
        stateText = customEpg;
      } 
      else if (programaNome && !epgInvalido.includes(programaNome)) {
        stateText = programaNome;
      } 
      else {
        stateText = "Guia de programação indisponível";
      }

      if (logosManuais[nomeCanal]) {
        logoFinal = logosManuais[nomeCanal];
      } else {
        const logoAtiva = document.querySelector('.liveFrameBody.active .liveFrameImg img') as HTMLImageElement | null;
        if (logoAtiva?.src) logoFinal = logoAtiva.src;
      }
    }
  }

  // FILMES
  else if (isMovie) {
    if (privateMode) {
      detailsText = "Filme Privado";
      logoFinal = logoPadrao;
    } else {
      const activeMovie = document.querySelector('.streamselector.posterDiv.active') as HTMLElement | null;
      const poster = activeMovie?.querySelector('img.mainsss') as HTMLImageElement | null;

      detailsText = (ultimoTituloFilme || poster?.alt || "Filme")
        .replace(/\s*\(\d{4}\).*$/, "") 
        .replace(/\[.*?\]/g, "")
        .trim();

      const infos = document.querySelectorAll('.two');
      const genero = (infos.length >= 4) ? (infos[3] as HTMLElement).textContent?.trim() : "";
      stateText = genero || "Cinema"; 

      logoFinal = ultimaLogoFilme || poster?.src || logoPadrao;
    }
  }

  // SÉRIES
  else if (isSeries) {
    if (privateMode) {
      detailsText = "Série Privada";
      logoFinal = logoPadrao;
    } else {
      const nomeSerieRaw = document.querySelector('.serieEpiName span') as HTMLElement | null;
      const nomeSerieText: string = nomeSerieRaw?.textContent?.trim() || ultimoTituloFilme || "Série";

      const partesSerie = nomeSerieText.split(' S');
      detailsText = (partesSerie[0] || "").trim();

      const descSeries = document.querySelector('.movieInDescription') as HTMLElement | null;
      const descEpisodio = document.querySelector('.serieEpiDesc span') as HTMLElement | null;
      const infoFinal = descSeries?.textContent?.trim() || descEpisodio?.textContent?.trim() || "";

      stateText = infoFinal && infoFinal !== "N/A" ? infoFinal : "Assistindo Série";

      const logoSerie = document.querySelector('.playstreamepimg') as HTMLElement | null;
      if (logoSerie) {
        const bg = getComputedStyle(logoSerie).backgroundImage || "";
        const match = bg.match(/url\(["']?(.*?)["']?\)/);
        if (match && match[1] && !match[1].includes('play.png')) {
          logoFinal = match[1];
        } else {
          logoFinal = ultimaLogoFilme || logoPadrao;
        }
      } else {
        logoFinal = ultimaLogoFilme || logoPadrao;
      }
    }
  }

  if (!detailsText) return;

  const video = document.querySelector('#custom-video-player_html5_api') as HTMLVideoElement | null;
  const estaPausado = video?.paused ?? true;
  const duration = video?.duration ?? 0;
  const currentTime = video?.currentTime ?? 0;

  let smallImageKey = "";
  let smallImageText = "";

  if (isLive) {
    smallImageKey = estaPausado
      ? 'https://i.imgur.com/iaL3b1R.png'  
      : 'https://i.imgur.com/LmOhe47.png'; 
    smallImageText = estaPausado ? 'PAUSADO' : 'AO VIVO';
  } 
  else if (isMovie || isSeries) {
    smallImageKey = estaPausado
      ? 'https://i.imgur.com/8LyLenq.png'  
      : 'https://i.imgur.com/ZsIDFdU.png'; 
    smallImageText = estaPausado ? 'Pausado' : 'Assistindo';
  }

  const presenceData: any = {
    details: detailsText,
    ...(stateText ? { state: stateText } : {}),
    largeImageKey: logoFinal,
    largeImageText: detailsText,
    smallImageKey,
    smallImageText,
    type: 3
  };

  if (!isLive && !estaPausado && duration > 0) {
    presenceData.endTimestamp = Math.floor(Date.now() / 1000) + Math.floor(duration - currentTime);
  } else {
    presenceData.startTimestamp = startBaseTimestamp;
  }

  presence.setActivity(presenceData);
});
