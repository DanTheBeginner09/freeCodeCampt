/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

interface Props {
  rwd?: Record<string, any>;
  js?: Record<string, any>;
}

export default function Challenge({ rwd, js }: Props) {
  const router = useRouter();
  const { superblock, block, id } = router.query;

  if (!superblock || !block || !id) return null;
  if (typeof block !== 'string') return null;
  if (!rwd || !js) return null;

  if (superblock === 'responsive-web-design') {
    const challenge = rwd[block].challenges.filter(
      (c: { dashedName: string }) => c.dashedName == id
    )[0].description;

    return <div dangerouslySetInnerHTML={{ __html: challenge }} />;
  } else if (superblock === 'javascript-algorithms-and-data-structures') {
    const challenge = js[block].challenges.filter(
      (c: { dashedName: string }) => c.dashedName == id
    )[0].description;

    return <div dangerouslySetInnerHTML={{ __html: challenge }} />;
  }
  return (
    <div>
      <ul>{rwd && Object.keys(rwd).map(name => <li key={name}>{name}</li>)}</ul>
      <ul>{js && Object.keys(js).map(name => <li key={name}>{name}</li>)}</ul>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const rwd = await fetch('http://localhost:3000/responsive-web-design');
  const js = await fetch(
    'http://localhost:3000/javascript-algorithms-and-data-structures'
  );
  const rwdBlocks = ((await rwd.json()) as { blocks: Record<string, unknown> })
    .blocks;
  const jsBlocks = ((await js.json()) as { blocks: Record<string, unknown> })
    .blocks;

  return { props: { rwd: rwdBlocks, js: jsBlocks }, revalidate: 5 };
};

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: true
});
