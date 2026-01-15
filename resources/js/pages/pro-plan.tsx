export default function ProPlan() {
    const projectDetails = {
        title: 'Custom Business Solution',
        description:
            "A fully responsive, high-performance web application tailored to your brand's unique needs. This plan includes SEO optimization, custom animations, and a dedicated CMS.",
        image: 'https://via.placeholder.com/600x400', // Replace with your custom website screenshot
        demoUrl: 'https://your-sample-site.com',
        features: [
            'Custom UI/UX Design',
            'Next.js & Tailwind CSS Architecture',
            'API Integration & Authentication',
            '24/7 Priority Support',
        ],
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Pro Plan Experience</h1>
                <p style={styles.subtitle}>
                    Elevate your digital presence with professional-grade
                    development.
                </p>
            </header>

            <hr style={styles.divider} />

            <main style={styles.content}>
                <div style={styles.imageWrapper}>
                    <img
                        src={projectDetails.image}
                        alt="Custom Website Preview"
                        style={styles.image}
                    />
                </div>

                <div style={styles.details}>
                    <h2>{projectDetails.title}</h2>
                    <p>{projectDetails.description}</p>

                    <ul style={styles.list}>
                        {projectDetails.features.map((feature, index) => (
                            <li key={index} style={styles.listItem}>
                                ✓ {feature}
                            </li>
                        ))}
                    </ul>

                    <a
                        href={projectDetails.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.button}
                    >
                        View Live Demo
                    </a>
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: 'system-ui, sans-serif',
        color: '#333',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    title: {
        fontSize: '2.5rem',
        color: '#1a1a1a',
        marginBottom: '10px',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#666',
    },
    divider: {
        border: '0',
        height: '1px',
        background: '#eee',
        marginBottom: '50px',
    },
    content: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '40px',
        alignItems: 'center',
    },
    imageWrapper: {
        flex: '1 1 400px',
    },
    image: {
        width: '100%',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid #eee',
    },
    details: {
        flex: '1 1 350px',
    },
    list: {
        listStyle: 'none',
        padding: '0',
        margin: '20px 0',
    },
    listItem: {
        marginBottom: '10px',
        color: '#059669', // Emerald green
        fontWeight: '500',
    },
    button: {
        display: 'inline-block',
        backgroundColor: '#0070f3',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold',
        marginTop: '10px',
        transition: 'background 0.2s',
    },
};
