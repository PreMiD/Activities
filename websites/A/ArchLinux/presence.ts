const presence = new Presence({
  clientId: '929881116679237653',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const { pathname, hostname } = document.location
const path1 = pathname.split('/')[1]

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/ArchLinux/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const archData: {
    [hostname: string]: {
      [pathname: string]: {
        [data: string]: string
      }
    }
  } = {
    'archlinux.org': {
      '': {
        details: 'Browsing the home page',
        state: 'h2',
      },
      'packages': {
        details: 'Browsing the official repo',
        state: 'h2',
      },
      'news': {
        details: 'Browsing the news archives',
        state: 'h2',
      },
      'donate': {
        details: 'Browsing the donation page',
      },
      'mirrorlist': {
        details: 'Browsing the Mirrorlist',
      },
      'mirrors': {
        details: 'Browsing the Mirrorlist',
      },
      'groups': {
        details: 'Browsing the package groups',
        state: 'h2',
      },
      'todo': {
        details: 'Browsing the todo lists',
        state: 'h2',
      },
      'people': {
        details: 'Browsing the people of Arch',
        state: 'h2',
      },
    },
    'bbs.archlinux.org': {
      '': {
        details: 'Browsing the forums',
      },
      'viewforum.php': {
        details: 'Browsing the forums',
        state: 'title',
      },
      'search.php': {
        details: 'Searching the forums',
      },
      'viewtopic.php': {
        details: 'Viewing a forum thread',
        state: 'title',
      },
    },
    'wiki.archlinux.org': {
      '': {
        details: 'Browsing the ArchWiki',
        state: 'h1',
      },
      'title': {
        details: 'Viewing an ArchWiki page',
        state: 'h1',
      },
    },
    'bugs.archlinux.org': {
      '': {
        details: 'Browsing the Bugtracker',
      },
      'task': {
        details: 'Viewing a bug report',
        state: 'title',
      },
    },
    'security.archlinux.org': {
      '': {
        details: 'Browsing security issues',
      },
    },
    'aur.archlinux.org': {
      '': {
        details: 'Browsing the user repository',
      },
    },
    'status.archlinux.org': {
      '': {
        details: 'Browsing the status dashboard',
      },
    },
    'lists.archlinux.org': {
      '': {
        details: 'Browsing the mailing lists',
      },
    },
    'archive.archlinux.org': {
      '': {
        details: 'Browsing the archive',
      },
    },
    'matrix.archlinux.org': {
      '': {
        details: 'Browsing nothing of importance...',
      },
    },
    'dashboards.archlinux.org': {
      '': {
        details: 'Browsing the Grafana dashboards',
      },
    },
    'conf.archlinux.org': {
      '': {
        details: 'Browsing the Arch Conferences',
      },
    },
    'whatcanidofor.archlinux.org': {
      '': {
        details: 'Learning how to help Arch Linux',
      },
    },
    'reproducible.archlinux.org': {
      '': {
        details: 'Browsing the Reproducible Status',
      },
    },
    'aur-dev.archlinux.org': {
      '': {
        details: 'Browsing the AUR-DEV Repository',
      },
    },
    'terms.archlinux.org': {
      '': {
        details: 'Browsing the terms of service',
      },
    },
    'gitlab.archlinux.org': {
      '': {
        details: 'Browsing the GitLab repository',
      },
    },
    'patchwork.archlinux.org': {
      '': {
        details: 'Browsing the patch tracking system',
      },
    },
    'man.archlinux.org': {
      '': {
        details: 'Browsing the manual pages',
      },
    },
  }

  if (hostname in archData && path1 && path1 in archData[hostname]!) {
    presenceData.details = archData[hostname]![path1]!.details
    if (archData[hostname]![path1]!.state) {
      presenceData.state = document
        .querySelectorAll(archData[hostname]![path1]!.state)
        .item(0)
        .innerHTML
        .replaceAll('&amp;', '&')
        .split(' / ')[0]
    }
  }
  else {
    presenceData.details = archData[hostname]!['']!.details
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})
