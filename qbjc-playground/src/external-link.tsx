import Link from '@material-ui/core/Link';
import LaunchIcon from '@material-ui/icons/Launch';
import React, {ReactNode} from 'react';

function ExternalLink({href, children}: {href: string; children: ReactNode}) {
  return (
    <Link href={href} target="_blank">
      {children}
      <LaunchIcon
        style={{
          fontSize: '0.9rem',
          verticalAlign: 'middle',
          marginLeft: '0.1rem',
        }}
      />
    </Link>
  );
}

export default ExternalLink;
