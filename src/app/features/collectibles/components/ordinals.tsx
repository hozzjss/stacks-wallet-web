import { useNavigate } from 'react-router-dom';

import { useInscriptionByTxidQuery } from '@app/query/bitcoin/ordinals/use-inscription-by-txid.query';
import { useInscriptionQuery } from '@app/query/bitcoin/ordinals/use-inscription.query';
import {
  TaprootUtxo,
  useTaprootAddressUtxosQuery,
} from '@app/query/bitcoin/ordinals/use-taproot-address-utxos.query';
import { createInfoUrl, whenOrdinalType } from '@app/query/bitcoin/ordinals/utils';

import { CollectibleImage } from './collectible-image';
import { CollectibleOther } from './collectible-other';
import { CollectibleText } from './collectible-text';

interface InscriptionProps {
  path: string;
  utxo: TaprootUtxo;
}

function Inscription({ path, utxo }: InscriptionProps) {
  const { isLoading, isError, data } = useInscriptionQuery(path);
  const navigate = useNavigate();
  if (isLoading) return null; // TODO

  if (isError) return null; // TODO

  const inscription = whenOrdinalType(data['content type'], {
    image: () => ({
      infoUrl: createInfoUrl(data.content),
      src: `https://ordinals.com${data.content}`,
      title: data.title,
      type: 'image',
    }),
    text: () => ({
      contentSrc: `https://ordinals.com${data.content}`,
      infoUrl: createInfoUrl(data.content),
      title: data.title,
      type: 'text',
    }),
    other: () => ({
      infoUrl: createInfoUrl(data.content),
      title: data.title,
      type: 'other',
    }),
  });

  switch (inscription.type) {
    case 'image': {
      return (
        <CollectibleImage
          key={inscription.title}
          onSelectCollectible={() =>
            navigate('/ord-send-test', {
              state: { inscription: data, utxo },
            })
          }
          // onSelectCollectible={() => openInNewTab(inscription.infoUrl)}
          src={inscription.src}
          subtitle="Ordinal inscription"
          title={inscription.title}
        />
      );
    }
    case 'text': {
      return (
        <CollectibleText
          key={inscription.title}
          onSelectCollectible={() =>
            navigate('/ord-send-test', {
              state: { inscription: data, utxo },
            })
          }
          // onSelectCollectible={() => openInNewTab(inscription.infoUrl)}
          contentSrc={inscription.contentSrc}
          subtitle="Ordinal inscription"
          title={inscription.title}
        />
      );
    }
    case 'other': {
      return (
        <CollectibleOther
          key={inscription.title}
          onSelectCollectible={() =>
            navigate('/ord-send-test', {
              state: { inscription: data, utxo },
            })
          }
          // onSelectCollectible={() => openInNewTab(inscription.infoUrl)}
          subtitle="Ordinal inscription"
          title={inscription.title}
        />
      );
    }
    default: {
      return null;
    }
  }
}

interface InscriptionLoaderProps {
  txid: string;
  children(path: string): JSX.Element;
}
function InscriptionLoader({ txid, children }: InscriptionLoaderProps) {
  const { data: inscriptionDetails } = useInscriptionByTxidQuery(txid);
  if (!inscriptionDetails) return null;
  console.log({ inscriptionDetails });
  return children(inscriptionDetails.inscriptions);
}

export function Ordinals() {
  const { data: utxos = [] } = useTaprootAddressUtxosQuery();
  console.log({ utxos });

  return (
    <>
      {utxos.map(utxo => (
        <InscriptionLoader key={utxo.txid} txid={utxo.txid}>
          {path => <Inscription path={path} utxo={utxo} />}
        </InscriptionLoader>
      ))}
    </>
  );
}
