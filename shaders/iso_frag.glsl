

in vec3 fragNormal;

uniform vec3 lightPosition;
uniform vec3 lightColor;
uniform vec3 surfaceColor;


void main()
{
    // compute the diffuse lighting
    vec3 normal = normalize(fragNormal);
    vec3 lightDir = normalize(lightPosition - gl_FragCoord.xyz);
    float diffuse = max(dot(normal, lightDir), 0.0);

    // compute the final color of the fragment
    gl_FragColor = vec4(surfaceColor * lightColor * diffuse, 1.0);
    gl_FragColor = vec4(1);
}