import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { DevicePixelArt } from '../components/toolbox/DevicePixelArt'
import { ExternalLink } from '../components/ui/ExternalLink'
import { applications, devices, peripherals } from '../content/toolbox'

export function ToolboxPage() {
  const applicationGroups = [...new Set(applications.map((app) => app.category))]

  return (
    <div className="toolbox-page">
      <header className="toolbox-intro shell">
        <p className="toolbox-path">~/toolbox</p>
        <h1>Toolbox<span aria-hidden="true">.</span></h1>
        <p>The hardware and applications I use.</p>
      </header>

      <section className="toolbox-section shell" aria-labelledby="devices-title">
        <div className="toolbox-section-heading"><h2 id="devices-title">Computers</h2></div>
        <div className="device-list">
          {devices.map((device) => (
            <article className="device-profile" id={device.id} key={device.id} aria-labelledby={`${device.id}-title`}>
              <div className="device-command"><span>{device.prompt}</span></div>
              <div className="device-body">
                <div className="device-art-panel"><DevicePixelArt kind={device.id} /></div>
                <div className="device-readout">
                  <div className="device-heading"><h3 id={`${device.id}-title`}>{device.name}</h3><p>{device.description}</p></div>
                  <dl className="device-specs">
                    {device.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}
                  </dl>
                  {device.productHref || device.buyHref ? <div className="product-actions device-actions">
                    {device.productHref ? <ExternalLink className="product-page-link" href={device.productHref} label={`${device.name} M4 tech specs (opens in a new tab)`}>Tech specs</ExternalLink> : null}
                    {device.buyHref ? <ExternalLink className="product-buy-link" href={device.buyHref} label={`${device.buyLabel ?? 'Buy on Shopee'} — Shopee affiliate link for Thailand (opens in a new tab)`}>{device.buyLabel ?? 'Buy on Shopee'}</ExternalLink> : null}
                    {device.buyHref ? <span className="device-affiliate-note">Shopee affiliate link · Thailand</span> : null}
                  </div> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="toolbox-section shell" aria-labelledby="peripherals-title">
        <div className="toolbox-section-heading"><h2 id="peripherals-title">Peripherals</h2></div>
        <dl className="peripheral-list">
          {peripherals.map((item) => <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
            {item.productHref || item.buyHref ? <div className="product-actions peripheral-actions">
              {item.productHref ? <ExternalLink className="product-page-link" href={item.productHref} label={`${item.value} product page (opens in a new tab)`}>Product page</ExternalLink> : null}
              {item.buyHref ? <ExternalLink className="product-buy-link" href={item.buyHref} label={`${item.buyLabel ?? 'Buy on Shopee'} — Shopee affiliate link (opens in a new tab)`}>{item.buyLabel ?? 'Buy on Shopee'}</ExternalLink> : null}
            </div> : null}
          </div>)}
        </dl>
        <p className="peripheral-disclosure">Shopee buy links are affiliate links for shoppers in Thailand. I may earn a commission at no extra cost to you. Some links lead to newer versions of the listed products.</p>
      </section>

      <section className="toolbox-section shell" aria-labelledby="applications-title">
        <div className="toolbox-section-heading"><h2 id="applications-title">Applications</h2></div>
        <div className="application-groups">
          {applicationGroups.map((group) => <div className="application-group" key={group}>
            <h3>{group}</h3>
            <ul>{applications.filter((app) => app.category === group).map((app) => <li key={app.id}>
              <a className="application-link" href={app.href} target="_blank" rel="noopener noreferrer" aria-label={`${app.name} official site (opens in a new tab)`}>
                <span className={`application-icon application-icon--${app.id}`}>
                  <Image src={app.icon} alt="" fill unoptimized sizes="34px" />
                </span>
                <span>{app.name}</span>
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
              </a>
            </li>)}</ul>
          </div>)}
        </div>
      </section>
    </div>
  )
}
