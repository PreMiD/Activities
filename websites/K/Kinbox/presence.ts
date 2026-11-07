const presence = new Presence({
  clientId: '1550222360765010050',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/K/Kinbox/assets/logo.png',
}

// Only fixed section names are shared. Never use page titles, contact names,
// message contents, query strings, workspace names or record IDs in the activity.
// More specific routes must precede their parent routes.
const sections: [string, string][] = [
  ['/inbox', 'Caixa de entrada'],
  ['/crm/deals', 'Funis de vendas'],
  ['/crm/tasks', 'Tarefas'],
  ['/crm/contacts', 'Contatos'],
  ['/crm/campaigns', 'Campanhas'],
  ['/crm/goals', 'Metas'],
  ['/reports', 'Relatórios'],
  ['/settings/account/profile', 'Perfil'],
  ['/settings/account/notifications', 'Notificações'],
  ['/settings/account/workspace', 'Configurações do ambiente'],
  ['/settings/members', 'Membros'],
  ['/settings/roles', 'Permissões'],
  ['/settings/groups', 'Grupos'],
  ['/settings/quick-phrases', 'Frases rápidas'],
  ['/settings/tags', 'Tags'],
  ['/settings/business-hours', 'Horários de atendimento'],
  ['/settings/custom-fields', 'Campos personalizados'],
  ['/settings/widget', 'Widget de atendimento'],
  ['/settings/voip', 'Voip'],
  ['/settings/channels', 'Canais'],
  ['/settings/agendas', 'Serviços de agendamento'],
  ['/settings/location', 'Locais de atendimento'],
  ['/settings/assignment-rules', 'Atribuição automática'],
  ['/settings/automations', 'Automações'],
  ['/settings/workflows', 'Cenários'],
  ['/settings/whatsapp-api', 'WhatsApp API'],
  ['/settings/bots', 'Bot'],
  ['/settings/agents', 'Agentes de IA'],
  ['/settings/copilot', 'Copiloto'],
  ['/settings/knowledge-bases', 'Base de conhecimento'],
  ['/settings/pipelines', 'Configuração de funis'],
  ['/settings/products', 'Produtos'],
  ['/settings/apps', 'Apps'],
  ['/settings/plugins', 'Plugins'],
  ['/settings/api', 'Configurações de API'],
  ['/settings/billing', 'Assinatura'],
  ['/settings/audit', 'Auditoria'],
  ['/settings', 'Configurações'],
  ['/admin', 'Administração'],
]

presence.on('UpdateData', async () => {
  const [showSection, showTimestamp] = await Promise.all([
    presence.getSetting<boolean>('showSection').catch(() => true),
    presence.getSetting<boolean>('showTimestamp').catch(() => true),
  ])
  // Read the current route after settings resolve, including after SPA navigation.
  const { hostname, pathname, protocol } = document.location
  const isPanel = protocol === 'https:'
    && ['app.kinbox.com.br', 'insider.kinbox.com.br', 'staging.kinbox.com.br'].includes(hostname)
  const isAuthentication = pathname === '/auth' || pathname.startsWith('/auth/')
  const hasPanelNavigation = document.querySelector('a[href="/inbox"]')
    && document.querySelector('a[href="/settings"]')

  if (!isPanel || isAuthentication || !hasPanelNavigation) {
    presence.clearActivity()
    return
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Trabalhando no Kinbox',
  }

  if (showSection) {
    presenceData.state = sections.find(([route]) =>
      pathname === route || pathname.startsWith(`${route}/`),
    )?.[1] ?? 'Painel do Kinbox'
  }

  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  presence.setActivity(presenceData)
})
